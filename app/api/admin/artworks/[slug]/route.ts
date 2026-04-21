import { NextResponse } from "next/server";

import {
  artworkInvariantsError,
  patchArtworkSchema,
} from "view/lib/artwork-payload";
import { prisma } from "view/lib/prisma";
import { prismaClientErrorToHttp } from "view/lib/prisma-http-error";
import { requireAdminResponse } from "view/lib/require-admin";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { slug } = await ctx.params;
  const existing = await prisma.artwork.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json();
  const parsed = patchArtworkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  const section = body.section ?? existing.section;
  const isCollectionComposite =
    body.isCollectionComposite !== undefined
      ? body.isCollectionComposite
      : existing.isCollectionComposite;

  const clearHotspots =
    section === "works" ||
    (section === "collection" && isCollectionComposite);

  const hotspotX = clearHotspots
    ? null
    : body.hotspotX !== undefined
      ? body.hotspotX
      : existing.hotspotX;
  const hotspotY = clearHotspots
    ? null
    : body.hotspotY !== undefined
      ? body.hotspotY
      : existing.hotspotY;
  const hotspotW = clearHotspots
    ? null
    : body.hotspotW !== undefined
      ? body.hotspotW
      : existing.hotspotW;
  const hotspotH = clearHotspots
    ? null
    : body.hotspotH !== undefined
      ? body.hotspotH
      : existing.hotspotH;

  const invariantMsg = artworkInvariantsError({
    section,
    isCollectionComposite,
    hotspotX,
    hotspotY,
    hotspotW,
    hotspotH,
  });
  if (invariantMsg) {
    return NextResponse.json({ error: invariantMsg }, { status: 400 });
  }

  const nextStatus = body.status ?? existing.status;
  let publishedAt: Date | null = existing.publishedAt;
  if (body.status !== undefined) {
    if (nextStatus === "published") {
      publishedAt = existing.publishedAt ?? new Date();
    } else {
      publishedAt = null;
    }
  }

  try {
    const updated = await prisma.artwork.update({
      where: { slug },
      data: {
        title: body.title ?? undefined,
        alt: body.alt ?? undefined,
        description: body.description ?? undefined,
        medium: body.medium ?? undefined,
        priceRub: body.priceRub !== undefined ? body.priceRub : undefined,
        section: body.section ?? undefined,
        status: body.status ?? undefined,
        aspectRatio:
          body.aspectRatio !== undefined ? body.aspectRatio : undefined,
        isCollectionComposite:
          body.isCollectionComposite !== undefined
            ? body.isCollectionComposite
            : undefined,
        hotspotX: clearHotspots
          ? null
          : body.hotspotX !== undefined
            ? body.hotspotX
            : undefined,
        hotspotY: clearHotspots
          ? null
          : body.hotspotY !== undefined
            ? body.hotspotY
            : undefined,
        hotspotW: clearHotspots
          ? null
          : body.hotspotW !== undefined
            ? body.hotspotW
            : undefined,
        hotspotH: clearHotspots
          ? null
          : body.hotspotH !== undefined
            ? body.hotspotH
            : undefined,
        sortOrder: body.sortOrder ?? undefined,
        collectionSeriesKey:
          body.collectionSeriesKey !== undefined
            ? body.collectionSeriesKey
            : undefined,
        publishedAt,
      },
      include: {
        artist: { select: { id: true, slug: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    const shouldReplaceImages =
      body.imageUrls !== undefined || Boolean(body.imageUrl);
    if (shouldReplaceImages) {
      const normalizedImageUrls =
        body.imageUrls?.map((u) => u.trim()).filter(Boolean) ??
        (body.imageUrl ? [body.imageUrl.trim()] : []);

      await prisma.artworkImage.deleteMany({
        where: { artworkId: updated.id },
      });
      if (normalizedImageUrls.length > 0) {
        await prisma.artworkImage.createMany({
          data: normalizedImageUrls.map((url, idx) => ({
            artworkId: updated.id,
            url,
            sortOrder: idx,
          })),
        });
      }
    }

    const fresh = await prisma.artwork.findUnique({
      where: { slug },
      include: {
        artist: { select: { id: true, slug: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: fresh });
  } catch (e) {
    const mapped = prismaClientErrorToHttp(e);
    if (mapped) {
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    console.error("[api/admin/artworks PATCH]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось сохранить изменения. Попробуйте позже или проверьте данные.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { slug } = await ctx.params;
  try {
    await prisma.artwork.delete({ where: { slug } });
  } catch (e) {
    const mapped = prismaClientErrorToHttp(e);
    if (mapped) {
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    return NextResponse.json({ error: "Запись не найдена." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
