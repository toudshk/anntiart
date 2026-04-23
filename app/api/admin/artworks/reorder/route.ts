import { ArtworkSection } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "view/lib/prisma";
import { prismaClientErrorToHttp } from "view/lib/prisma-http-error";
import { requireAdminResponse } from "view/lib/require-admin";

const bodySchema = z.object({
  section: z.enum(["works", "collection"]),
  orderedSlugs: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { section, orderedSlugs } = parsed.data;
  const sectionEnum =
    section === "works" ? ArtworkSection.works : ArtworkSection.collection;

  const existing = await prisma.artwork.findMany({
    where: { section: sectionEnum },
    select: { slug: true },
  });
  const dbSet = new Set(existing.map((e) => e.slug));
  const orderSet = new Set(orderedSlugs);
  if (
    orderedSlugs.length !== dbSet.size ||
    orderSet.size !== orderedSlugs.length ||
    !orderedSlugs.every((s) => dbSet.has(s))
  ) {
    return NextResponse.json(
      {
        error:
          "Список slug должен в точности совпадать с записями раздела (без пропусков, дубликатов и лишних).",
      },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(
      orderedSlugs.map((slug, sortOrder) =>
        prisma.artwork.update({
          where: { slug },
          data: { sortOrder },
        }),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const mapped = prismaClientErrorToHttp(e);
    if (mapped) {
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    console.error("[api/admin/artworks/reorder POST]", e);
    return NextResponse.json(
      { error: "Не удалось сохранить порядок." },
      { status: 500 },
    );
  }
}
