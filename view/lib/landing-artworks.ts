import { ArtworkSection } from "@prisma/client";

import type { PictureItem } from "view/constants/pictures";
import { PICTURE_ITEMS } from "view/constants/pictures";
import type { WorkMeta } from "view/constants/works-meta";
import { hasInteractiveCollectionSeries } from "view/lib/collection-series";
import { dbArtworkToPictureItem, dbArtworkToWorkMeta } from "view/lib/map-db-artwork";
import { prisma } from "view/lib/prisma";

export type LandingArtworkBundle = {
  works: PictureItem[];
  collection: PictureItem[];
  workMeta: Record<string, WorkMeta>;
  /** Подписи к общей композиции и фрагментам (slug = id в PictureItem). */
  collectionMeta: Record<string, WorkMeta>;
};

const COLLECTION_INTRO_FALLBACK =
  "Одна сцена на мольберте объединяет несколько эскизов — проведите курсором по композиции, чтобы увидеть каждую мини-картину отдельно.";

function collectionMetaFromPictureItems(
  items: PictureItem[],
): Record<string, WorkMeta> {
  const out: Record<string, WorkMeta> = {};
  for (const item of items) {
    if (item.section !== "collection") continue;
    out[item.id] = item.isCollectionComposite
      ? {
          title: item.alt,
          medium: "Серия",
          text: COLLECTION_INTRO_FALLBACK,
          status: "published",
        }
      : {
          title: item.alt,
          medium: "Масло, холст",
          text: item.alt,
          status: "published",
        };
  }
  return out;
}

function staticBundle(): LandingArtworkBundle {
  const collection = PICTURE_ITEMS.filter((i) => i.section === "collection");
  return {
    works: [],
    collection,
    workMeta: {},
    collectionMeta: collectionMetaFromPictureItems(collection),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Одна попытка собрать бандл из БД. При ошибке — исключение (ретраи снаружи).
 */
async function fetchLandingBundleFromDb(
  fallback: LandingArtworkBundle,
): Promise<LandingArtworkBundle> {
  const rows = await prisma.artwork.findMany({
    /* Как в админке: sortOrder, при равенстве — сначала новые. */
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  const dbWorks = rows.filter((r) => r.section === ArtworkSection.works);
  const dbColl = rows.filter((r) => r.section === ArtworkSection.collection);

  const works = dbWorks.map(dbArtworkToPictureItem);

  const dbCollectionItems = dbColl.map(dbArtworkToPictureItem);
  const useDbCollection =
    dbColl.length > 0 && hasInteractiveCollectionSeries(dbCollectionItems);
  const collection = useDbCollection
    ? dbCollectionItems
    : fallback.collection;

  const workMeta: Record<string, WorkMeta> = {};
  for (const row of dbWorks) {
    workMeta[row.slug] = dbArtworkToWorkMeta(row);
  }

  const collectionMeta = useDbCollection
    ? Object.fromEntries(
        dbColl.map((row) => [row.slug, dbArtworkToWorkMeta(row)] as const),
      )
    : fallback.collectionMeta;

  return { works, collection, workMeta, collectionMeta };
}

/** Задержки между попытками (холодный пул БД / сетевые таймауты на проде). */
const RETRY_DELAYS_MS = [0, 120, 350] as const;

/**
 * Работы для главной страницы: блок "Работы" только из БД,
 * для серии при отсутствии записей остаётся fallback на статику.
 *
 * При временном сбое запроса раньше сразу отдавался staticBundle с works: [] —
 * в UI было «0/0», после перезагрузки данные подтягивались. Ретраи снижают это.
 */
export async function getLandingArtworkBundle(): Promise<LandingArtworkBundle> {
  const fallback = staticBundle();

  let lastErr: unknown;
  for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
    if (RETRY_DELAYS_MS[i] > 0) {
      await sleep(RETRY_DELAYS_MS[i]);
    }
    try {
      return await fetchLandingBundleFromDb(fallback);
    } catch (e) {
      lastErr = e;
    }
  }

  console.error("getLandingArtworkBundle: все попытки БД провалились", lastErr);
  return fallback;
}
