/** Строка списка админки (коллекция + работы). */
export type AdminArtworkListItem = {
  id: string;
  slug: string;
  title: string;
  section: string;
  status: string;
  isCollectionComposite: boolean;
  collectionSeriesKey: string | null;
  sortOrder: number;
  images: { url: string }[];
};

export type AdminCollectionGroup = {
  seriesKey: string;
  main: AdminArtworkListItem | null;
  fragments: AdminArtworkListItem[];
};

function minSort(items: AdminArtworkListItem[]): number {
  return items.length ? Math.min(...items.map((i) => i.sortOrder)) : 0;
}

export function groupKeyedCollections(
  collectionRows: AdminArtworkListItem[],
): AdminCollectionGroup[] {
  const map = new Map<string, AdminCollectionGroup>();
  for (const a of collectionRows) {
    const k = a.collectionSeriesKey?.trim();
    if (!k) continue;
    if (!map.has(k)) {
      map.set(k, { seriesKey: k, main: null, fragments: [] });
    }
    const g = map.get(k)!;
    if (a.isCollectionComposite) g.main = a;
    else g.fragments.push(a);
  }
  return [...map.values()].sort((a, b) => {
    const oa = minSort(
      [a.main, ...a.fragments].filter(Boolean) as AdminArtworkListItem[],
    );
    const ob = minSort(
      [b.main, ...b.fragments].filter(Boolean) as AdminArtworkListItem[],
    );
    return oa - ob || a.seriesKey.localeCompare(b.seriesKey);
  });
}

export function collectionRowsWithoutSeriesKey(
  collectionRows: AdminArtworkListItem[],
): AdminArtworkListItem[] {
  return collectionRows
    .filter((a) => !a.collectionSeriesKey?.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}
