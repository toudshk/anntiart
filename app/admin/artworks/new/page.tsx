import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  ArtworkForm,
  type ArtworkCreatePreset,
} from "view/components/Admin/ArtworkForm";
import { authOptions } from "view/lib/auth";

function firstQuery(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function NewArtworkPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const sp = props.searchParams ? await props.searchParams : {};
  const seriesRaw = firstQuery(sp.series)?.trim();
  const preset = firstQuery(sp.preset)?.trim();

  let createPreset: ArtworkCreatePreset | undefined;
  if (seriesRaw) {
    createPreset = {
      section: "collection",
      isCollectionComposite: false,
      collectionSeriesKey: decodeURIComponent(seriesRaw),
    };
  } else if (preset === "collection-main") {
    createPreset = {
      section: "collection",
      isCollectionComposite: true,
      autoCollectionSeriesKey: true,
    };
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#dddad5_0%,#ebe8e2_35%,#f7f6f3_100%)] px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center rounded-lg bg-white/70 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← Назад
        </Link>
        <ArtworkForm mode="create" createPreset={createPreset} />
      </div>
    </div>
  );
}
