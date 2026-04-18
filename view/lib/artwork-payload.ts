import { ArtworkSection, ArtworkStatus } from "@prisma/client";
import { z } from "zod";

const imageUrlSchema = z.string().refine(
  (s) => s.startsWith("/") || /^https?:\/\//i.test(s),
  "Укажите путь (/pictures/...) или полный URL",
);

export type ArtworkInvariantInput = {
  section: ArtworkSection;
  widthCm: number | null | undefined;
  heightCm: number | null | undefined;
  isCollectionComposite: boolean;
  hotspotX: number | null | undefined;
  hotspotY: number | null | undefined;
  hotspotW: number | null | undefined;
  hotspotH: number | null | undefined;
};

export function artworkInvariantsError(val: ArtworkInvariantInput): string | null {
  if (val.section === ArtworkSection.collection) {
    if (val.isCollectionComposite) {
      if (
        val.hotspotX != null ||
        val.hotspotY != null ||
        val.hotspotW != null ||
        val.hotspotH != null
      ) {
        return "У общей композиции не должно быть областей hotspot.";
      }
    } else if (
      val.hotspotX == null ||
      val.hotspotY == null ||
      val.hotspotW == null ||
      val.hotspotH == null
    ) {
      return "Для фрагмента коллекции укажите hotspot: x, y, ширина и высота (в % от композиции).";
    }
  } else {
    if (val.isCollectionComposite) {
      return "Режим «общая композиция» доступен только для секции «Коллекция».";
    }
    if (
      val.hotspotX != null ||
      val.hotspotY != null ||
      val.hotspotW != null ||
      val.hotspotH != null
    ) {
      return "Hotspot задаётся только у фрагментов коллекции.";
    }
  }
  return null;
}

export const createArtworkSchema = z
  .object({
    slug: z.string().min(2).max(120),
    title: z.string().min(1).max(180),
    alt: z.string().min(1).max(240),
    description: z.string().min(1),
    medium: z.string().min(1).max(120),
    widthCm: z.number().int().positive().optional(),
    heightCm: z.number().int().positive().optional(),
    priceRub: z.number().int().nonnegative().optional(),
    section: z.nativeEnum(ArtworkSection).default(ArtworkSection.works),
    status: z.nativeEnum(ArtworkStatus).default(ArtworkStatus.published),
    aspectRatio: z.string().regex(/^\d+\/\d+$/).optional(),
    artistSlug: z.string().default("anna-tikhonenko"),
    imageUrl: imageUrlSchema,
    isCollectionComposite: z.boolean().default(false),
    hotspotX: z.number().min(0).max(100).optional(),
    hotspotY: z.number().min(0).max(100).optional(),
    hotspotW: z.number().min(0).max(100).optional(),
    hotspotH: z.number().min(0).max(100).optional(),
    sortOrder: z.number().int().default(0),
    collectionSeriesKey: z
      .string()
      .trim()
      .max(120)
      .optional()
      .refine(
        (s) => s === undefined || s === "" || /^[a-zA-Z0-9_-]+$/.test(s),
        "Ключ серии: латиница, цифры, дефис или подчёркивание",
      )
      .transform((s) => (!s ? undefined : s)),
  })
  .superRefine((val, ctx) => {
    const msg = artworkInvariantsError({
      section: val.section,
      widthCm: val.widthCm,
      heightCm: val.heightCm,
      isCollectionComposite: val.isCollectionComposite,
      hotspotX: val.hotspotX,
      hotspotY: val.hotspotY,
      hotspotW: val.hotspotW,
      hotspotH: val.hotspotH,
    });
    if (msg) {
      ctx.addIssue({ code: "custom", message: msg });
    }
  });

export const patchArtworkSchema = z
  .object({
    title: z.string().min(1).max(180).optional(),
    alt: z.string().min(1).max(240).optional(),
    description: z.string().min(1).optional(),
    medium: z.string().min(1).max(120).optional(),
    widthCm: z.number().int().positive().nullable().optional(),
    heightCm: z.number().int().positive().nullable().optional(),
    priceRub: z.number().int().nonnegative().nullable().optional(),
    section: z.nativeEnum(ArtworkSection).optional(),
    status: z.nativeEnum(ArtworkStatus).optional(),
    aspectRatio: z.string().regex(/^\d+\/\d+$/).nullable().optional(),
    isCollectionComposite: z.boolean().optional(),
    hotspotX: z.number().min(0).max(100).nullable().optional(),
    hotspotY: z.number().min(0).max(100).nullable().optional(),
    hotspotW: z.number().min(0).max(100).nullable().optional(),
    hotspotH: z.number().min(0).max(100).nullable().optional(),
    sortOrder: z.number().int().optional(),
    imageUrl: imageUrlSchema.optional(),
    collectionSeriesKey: z
      .string()
      .trim()
      .max(120)
      .regex(/^[a-zA-Z0-9_-]+$/)
      .nullable()
      .optional(),
  })
  .strict();
