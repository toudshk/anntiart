import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  ArtworkForm,
  type ArtworkFormInitial,
} from "view/components/Admin/ArtworkForm";
import { AdminDatabaseError } from "view/components/Admin/AdminDatabaseError";
import { authOptions } from "view/lib/auth";
import { isDbConnectionError } from "view/lib/is-db-connection-error";
import { prisma } from "view/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export default async function EditArtworkPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const { slug } = await params;
  let artwork;
  try {
    artwork = await prisma.artwork.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (e) {
    if (isDbConnectionError(e)) {
      return (
        <AdminDatabaseError
          detail={e instanceof Error ? e.message : undefined}
        />
      );
    }
    throw e;
  }
  if (!artwork) notFound();

  const initial: ArtworkFormInitial = {
    slug: artwork.slug,
    title: artwork.title,
    alt: artwork.alt,
    description: artwork.description,
    medium: artwork.medium,
    priceRub: artwork.priceRub,
    section: artwork.section,
    status: artwork.status,
    aspectRatio: artwork.aspectRatio ?? "",
    isCollectionComposite: artwork.isCollectionComposite,
    hotspotX: artwork.hotspotX,
    hotspotY: artwork.hotspotY,
    hotspotW: artwork.hotspotW,
    hotspotH: artwork.hotspotH,
    collectionSeriesKey: artwork.collectionSeriesKey ?? "",
    imageUrlsText: artwork.images.map((img) => img.url).join("\n"),
    imageUrl: artwork.images[0]?.url ?? "",
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#dddad5_0%,#ebe8e2_35%,#f7f6f3_100%)] px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center rounded-lg bg-white/70 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← Назад
        </Link>
        <ArtworkForm mode="edit" initial={initial} />
      </div>
    </div>
  );
}
