import { NextResponse } from "next/server";

import { createArtworkSchema } from "view/lib/artwork-payload";
import { prisma } from "view/lib/prisma";
import { prismaClientErrorToHttp } from "view/lib/prisma-http-error";
import { requireAdminResponse } from "view/lib/require-admin";

export async function GET() {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const artworks = await prisma.artwork.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      artist: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ data: artworks });
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const json = await req.json();
  const parsed = createArtworkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const artist = await prisma.artist.upsert({
    where: { slug: data.artistSlug },
    create: { slug: data.artistSlug, name: "Анна Тихоненко" },
    update: {},
  });

  const hotspotData =
    data.section === "collection" && data.isCollectionComposite
      ? { hotspotX: null, hotspotY: null, hotspotW: null, hotspotH: null }
      : data.section === "collection"
        ? {
            hotspotX: data.hotspotX ?? null,
            hotspotY: data.hotspotY ?? null,
            hotspotW: data.hotspotW ?? null,
            hotspotH: data.hotspotH ?? null,
          }
        : { hotspotX: null, hotspotY: null, hotspotW: null, hotspotH: null };
  const normalizedImageUrls =
    data.imageUrls?.map((u) => u.trim()).filter(Boolean) ??
    (data.imageUrl ? [data.imageUrl.trim()] : []);

  try {
    const artwork = await prisma.artwork.create({
      data: {
        slug: data.slug,
        title: data.title,
        alt: data.alt,
        description: data.description,
        medium: data.medium,
        widthCm: null,
        heightCm: null,
        priceRub: data.priceRub,
        section: data.section,
        status: data.status,
        aspectRatio: data.aspectRatio,
        isCollectionComposite: data.isCollectionComposite,
        sortOrder: data.sortOrder,
        completedOn: data.completedOn
          ? new Date(`${data.completedOn}T12:00:00.000Z`)
          : null,
        collectionSeriesKey:
          data.section === "collection" && data.collectionSeriesKey
            ? data.collectionSeriesKey
            : null,
        ...hotspotData,
        artistId: artist.id,
        publishedAt: data.status === "published" ? new Date() : null,
        images: {
          create: normalizedImageUrls.map((url, idx) => ({
            url,
            sortOrder: idx,
          })),
        },
      },
      include: {
        artist: { select: { id: true, slug: true, name: true } },
        images: true,
      },
    });

    return NextResponse.json({ data: artwork }, { status: 201 });
  } catch (e) {
    const mapped = prismaClientErrorToHttp(e);
    if (mapped) {
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    console.error("[api/admin/artworks POST]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось создать запись. Попробуйте позже или проверьте данные.",
      },
      { status: 500 },
    );
  }
}
