import type { PictureItem } from "view/constants/pictures";

/** Одна интерактивная коллекция: общая композиция + её фрагменты с hotspot. */
export type CollectionSeriesSlide = {
  main: PictureItem;
  related: PictureItem[];
};

function minSortOrder(items: PictureItem[]): number {
  return Math.min(...items.map((i) => i.sortOrder ?? 0));
}

function sortSlides(slides: CollectionSeriesSlide[]): CollectionSeriesSlide[] {
  return [...slides].sort(
    (a, b) =>
      minSortOrder([a.main, ...a.related]) -
      minSortOrder([b.main, ...b.related]),
  );
}

/** Группировка по полю `collectionSeriesKey` из БД (одинаковый ключ у композиции и фрагментов). */
function partitionBySeriesKey(items: PictureItem[]): CollectionSeriesSlide[] {
  const byKey = new Map<string, PictureItem[]>();
  for (const item of items) {
    const k = item.collectionSeriesKey?.trim();
    if (!k) continue;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(item);
  }
  const slides: CollectionSeriesSlide[] = [];
  for (const [, group] of byKey) {
    const main = group.find((i) => i.isCollectionComposite && i.src?.trim());
    const related = group.filter((i) => !i.isCollectionComposite && i.hotspot);
    if (main && related.length > 0) {
      slides.push({ main, related });
    }
  }
  return sortSlides(slides);
}

/** Фрагменты с hotspot, идущие в списке перед каждой композицией (как в статике). */
function partitionFragmentsThenComposite(
  items: PictureItem[],
): CollectionSeriesSlide[] {
  const composites: { main: PictureItem; idx: number }[] = [];
  items.forEach((item, idx) => {
    if (item.isCollectionComposite && item.src?.trim()) {
      composites.push({ main: item, idx });
    }
  });
  if (composites.length === 0) return [];

  const out: CollectionSeriesSlide[] = [];
  for (let j = 0; j < composites.length; j++) {
    const { main, idx } = composites[j]!;
    const start = j === 0 ? 0 : composites[j - 1]!.idx + 1;
    const related = items
      .slice(start, idx)
      .filter((i) => !i.isCollectionComposite && i.hotspot);
    if (related.length > 0) {
      out.push({ main, related });
    }
  }
  return out;
}

/** Композиция, за ней фрагменты до следующей композиции. */
function partitionCompositeThenFragments(
  items: PictureItem[],
): CollectionSeriesSlide[] {
  const out: CollectionSeriesSlide[] = [];
  let current: CollectionSeriesSlide | null = null;
  for (const item of items) {
    if (item.isCollectionComposite && item.src?.trim()) {
      if (current && current.related.length > 0) {
        out.push(current);
      }
      current = { main: item, related: [] };
    } else if (current && !item.isCollectionComposite && item.hotspot) {
      current.related.push(item);
    }
  }
  if (current && current.related.length > 0) {
    out.push(current);
  }
  return out;
}

function partitionLegacyOrder(items: PictureItem[]): CollectionSeriesSlide[] {
  const a = partitionFragmentsThenComposite(items);
  if (a.length > 0) return a;
  return partitionCompositeThenFragments(items);
}

/**
 * Разбивает список коллекции на серии.
 * Если у записей задан `collectionSeriesKey` — только он определяет состав серий
 * (решает путаницу при любом порядке в общем списке).
 * Иначе — эвристика по порядку в массиве (статика и старые данные).
 */
export function partitionCollectionSeries(
  items: PictureItem[],
): CollectionSeriesSlide[] {
  const coll = items.filter((i) => i.section === "collection");
  if (coll.length === 0) return [];

  const keyed = coll.filter((i) => Boolean(i.collectionSeriesKey?.trim()));
  if (keyed.length > 0) {
    return partitionBySeriesKey(coll);
  }
  return partitionLegacyOrder(coll);
}

export function hasInteractiveCollectionSeries(items: PictureItem[]): boolean {
  return partitionCollectionSeries(items).length > 0;
}
