export type ArtworkSection = "works" | "collection";
export type ArtworkStatus = "draft" | "published" | "sold" | "reserved";

export type ArtworkFormInitial = {
  slug: string;
  title: string;
  alt: string;
  description: string;
  medium: string;
  priceRub: number | null;
  section: ArtworkSection;
  status: ArtworkStatus;
  aspectRatio: string;
  isCollectionComposite: boolean;
  hotspotX: number | null;
  hotspotY: number | null;
  hotspotW: number | null;
  hotspotH: number | null;
  collectionSeriesKey: string;
  imageUrlsText: string;
  imageUrl: string;
};

export type ArtworkCreatePreset = {
  section?: ArtworkSection;
  isCollectionComposite?: boolean;
  collectionSeriesKey?: string;
  autoCollectionSeriesKey?: boolean;
};
