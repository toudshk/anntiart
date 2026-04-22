import { PICTURE_ITEMS, type PictureItem } from "view/constants/pictures";
import { STATIC_WORKS_META, type WorkMeta } from "view/constants/works-meta";

export const FALLBACK_WORKS = PICTURE_ITEMS.filter(
  (item) => item.section === "works",
);
export const FALLBACK_COLLECTION = PICTURE_ITEMS.filter(
  (item) => item.section === "collection",
);

export type PicturesGalleryProps = {
  works?: PictureItem[];
  collection?: PictureItem[];
  workMeta?: Record<string, WorkMeta>;
  collectionMeta?: Record<string, WorkMeta>;
};

export type MasonryPhoto = {
  key: string;
  src: string;
  alt: string;
  title: string;
  category: "Работы" | "Серии";
  status?: WorkMeta["status"];
};

export const COLLECTION_SECTION_INTRO =
  "Одна сцена на мольберте объединяет несколько эскизов — проведите курсором по композиции, чтобы увидеть каждую мини-картину отдельно.";

export function getWorkMetaFallback(activeWork: PictureItem | undefined): WorkMeta {
  return (
    {
      status: "published",
      ...(STATIC_WORKS_META[activeWork?.id ?? ""] ?? {
      title: activeWork?.alt ?? "Работа",
      medium: "Масло, холст",
      text: "Описание будет добавлено позже.",
      }),
    }
  );
}

/** Заголовок серии над блоком: из title общей композиции или часть alt до « — ». */
export function seriesHeading(main: PictureItem, meta?: WorkMeta): string {
  const raw = meta?.title?.trim() || main.alt;
  const sep = " — ";
  const i = raw.indexOf(sep);
  return i > 0 ? raw.slice(0, i).trim() : raw;
}

export function buildMasonryPhotos(
  works: PictureItem[],
  collection: PictureItem[],
  workMeta: Record<string, WorkMeta>,
  collectionMeta: Record<string, WorkMeta>,
): MasonryPhoto[] {
  const out: MasonryPhoto[] = [];

  const appendGroup = (
    items: PictureItem[],
    metaMap: Record<string, WorkMeta>,
    category: MasonryPhoto["category"],
  ) => {
    for (const item of items) {
      if (category === "Серии" && item.isCollectionComposite) continue;
      const meta = metaMap[item.id];
      const title = meta?.title?.trim() || item.alt;
      out.push({
        key: `${category}:${item.id}:main`,
        src: item.src,
        alt: item.alt,
        title,
        category,
        status: meta?.status ?? "published",
      });
      meta?.detailImageUrls?.forEach((src, idx) => {
        out.push({
          key: `${category}:${item.id}:detail:${idx}`,
          src,
          alt: `${title} — деталь ${idx + 1}`,
          title,
          category,
          status: meta?.status ?? "published",
        });
      });
    }
  };

  appendGroup(works, workMeta, "Работы");
  appendGroup(collection, collectionMeta, "Серии");
  return out;
}
