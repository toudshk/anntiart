import { aspectRatioFromCm } from "view/lib/aspect-ratio";
import type { AdminArtworkSummary } from "view/requests";

import type {
  ArtworkCreatePreset,
  ArtworkFormInitial,
} from "./types";

export function boxAspectFromSummary(row: AdminArtworkSummary): string {
  if (row.aspectRatio && /^\d+\/\d+$/.test(row.aspectRatio)) {
    return row.aspectRatio;
  }
  if (row.widthCm && row.heightCm) {
    return aspectRatioFromCm(row.widthCm, row.heightCm);
  }
  return "2/3";
}

export const emptyCreate = (): ArtworkFormInitial => ({
  slug: "",
  title: "",
  alt: "",
  description: "",
  medium: "",
  priceRub: null,
  section: "works",
  status: "published",
  aspectRatio: "",
  isCollectionComposite: false,
  hotspotX: null,
  hotspotY: null,
  hotspotW: null,
  hotspotH: null,
  collectionSeriesKey: "",
  imageUrlsText: "",
  imageUrl: "",
});

export function isFragmentCreatePreset(
  preset: ArtworkCreatePreset | undefined,
): boolean {
  return Boolean(
    preset &&
      preset.collectionSeriesKey?.trim() &&
      preset.isCollectionComposite === false &&
      !preset.autoCollectionSeriesKey,
  );
}

export function mergeCreateDefaults(
  preset: ArtworkCreatePreset | undefined,
): ArtworkFormInitial {
  const base = emptyCreate();
  if (!preset) return base;
  return {
    ...base,
    ...(preset.section ? { section: preset.section } : {}),
    ...(preset.isCollectionComposite !== undefined
      ? { isCollectionComposite: preset.isCollectionComposite }
      : {}),
    ...(preset.collectionSeriesKey
      ? { collectionSeriesKey: preset.collectionSeriesKey }
      : {}),
  };
}

export function parseImageUrls(
  imageUrlsText: string,
  fallbackImageUrl: string,
): string[] {
  const fromText = imageUrlsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const withFallback =
    fromText.length > 0
      ? fromText
      : fallbackImageUrl.trim()
        ? [fallbackImageUrl.trim()]
        : [];
  return Array.from(new Set(withFallback));
}

export function parseOptionalNumber(v: string) {
  return v === "" ? null : Number(v);
}
