import type { Artwork, ArtworkImage } from "@prisma/client";

import type { PictureItem } from "view/constants/pictures";
import type { WorkMeta } from "view/constants/works-meta";
import { aspectRatioFromCm } from "view/lib/aspect-ratio";

export type ArtworkWithImages = Artwork & { images: ArtworkImage[] };

export function dbArtworkToPictureItem(row: ArtworkWithImages): PictureItem {
  const src = row.images[0]?.url ?? "";
  let aspectRatio: PictureItem["aspectRatio"];
  if (row.aspectRatio && /^\d+\/\d+$/.test(row.aspectRatio)) {
    aspectRatio = row.aspectRatio as PictureItem["aspectRatio"];
  } else if (row.widthCm && row.heightCm) {
    aspectRatio = aspectRatioFromCm(row.widthCm, row.heightCm);
  } else if (row.section === "collection") {
    aspectRatio = "2/3";
  }

  const item: PictureItem = {
    id: row.slug,
    src,
    alt: row.alt,
    aspectRatio,
    section: row.section === "collection" ? "collection" : "works",
    isCollectionComposite: row.isCollectionComposite,
    collectionSeriesKey: row.collectionSeriesKey,
    sortOrder: row.sortOrder,
  };

  if (
    row.section === "collection" &&
    !row.isCollectionComposite &&
    row.hotspotX != null &&
    row.hotspotY != null &&
    row.hotspotW != null &&
    row.hotspotH != null
  ) {
    item.hotspot = {
      x: row.hotspotX,
      y: row.hotspotY,
      w: row.hotspotW,
      h: row.hotspotH,
    };
  }

  return item;
}

export function dbArtworkToWorkMeta(row: ArtworkWithImages): WorkMeta {
  return {
    title: row.title,
    medium: row.medium,
    text: row.description,
    status: row.status,
    priceRub: row.priceRub,
    detailImageUrls: row.images.slice(1).map((img) => img.url),
  };
}
