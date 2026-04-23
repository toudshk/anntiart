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


/**
 * Работы для главной страницы: блок "Работы" только из БД,
 * для серии при отсутствии записей остаётся fallback на статику.
 */
export async function getLandingArtworkBundle(): Promise<LandingArtworkBundle> {
  const fallback = staticBundle();

  try {
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
  } catch {
    return fallback;
  }
}
