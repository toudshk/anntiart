import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AdminDatabaseError } from "view/components/Admin/AdminDatabaseError";
import { AdminWorksReorderList } from "view/components/Admin/AdminWorksReorderList";
import { AdminDeleteArtworkButton } from "view/components/Admin/AdminDeleteArtworkButton";
import { AdminSignOut } from "view/components/Admin/AdminSignOut";
import {
  collectionRowsWithoutSeriesKey,
  groupKeyedCollections,
  type AdminArtworkListItem,
} from "view/lib/admin-collection-groups";
import { authOptions } from "view/lib/auth";
import { isDbConnectionError } from "view/lib/is-db-connection-error";
import { prisma } from "view/lib/prisma";

/** Крупные действия: добавить запись */
const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";

/** Редактирование, композиция, добавить фрагмент — один стиль */
const btnSecondary =
  "inline-flex items-center justify-center rounded-full border border-zinc-400/80 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-800 shadow-xs transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:border-zinc-400 dark:hover:bg-zinc-700";

function thumbUrl(a: AdminArtworkListItem): string | null {
  return a.images[0]?.url ?? null;
}

function ArtworkRow({
  a,
  subtitle,
}: {
  a: AdminArtworkListItem;
  subtitle?: ReactNode;
}) {
  const thumb = thumbUrl(a);
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-zinc-200/90 bg-white/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="break-words font-medium leading-snug text-zinc-900 dark:text-zinc-50">
          {a.title}
        </p>
        <p className="mt-0.5 break-words text-xs leading-snug text-zinc-500">
          {subtitle ?? (
            <>
              {a.section === "collection" ? "Серия" : "Работы"} ·{" "}
              {a.status} · {a.slug}
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 justify-self-end">
        <Link
          href={`/admin/artworks/${encodeURIComponent(a.slug)}`}
          className={btnSecondary}
        >
          Изменить
        </Link>
        <AdminDeleteArtworkButton slug={a.slug} title={a.title} />
      </div>
    </li>
  );
}

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  let artworks: AdminArtworkListItem[];
  try {
    artworks = await prisma.artwork.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        section: true,
        status: true,
        isCollectionComposite: true,
        collectionSeriesKey: true,
        sortOrder: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
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

  const worksRows = artworks.filter((a) => a.section === "works");
  const collectionRows = artworks.filter((a) => a.section === "collection");
  const keyedGroups = groupKeyedCollections(collectionRows);
  const standaloneCollections =
    collectionRowsWithoutSeriesKey(collectionRows);

  return (
    <div className="min-h-dvh bg-pastel-hero px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Админка
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Работы и серии на лендинге
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              На сайт
            </Link>
            <AdminSignOut />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <section>
            <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h2 className="text-lg font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                Работы
              </h2>
              <Link href="/admin/artworks/new" className={btnPrimary}>
                Добавить работу
              </Link>
            </div>
            {worksRows.length ? (
              <>
                <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Порядок в списке совпадает с блоком «Картины» на сайте. Стрелки ↑↓
                  меняют местами соседние записи.
                </p>
                <AdminWorksReorderList items={worksRows} />
              </>
            ) : (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Пока нет работ в разделе «Работы».
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h2 className="text-lg font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                Серии
              </h2>
              <Link
                href="/admin/artworks/new?preset=collection-main"
                className={btnPrimary}
              >
                Добавить серию
              </Link>
            </div>

            <ul className="space-y-4">
              {keyedGroups.map((g) => {
                const mainThumb = g.main ? thumbUrl(g.main) : null;
                const fragments = [...g.fragments].sort(
                  (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
                );
                const previewThumb =
                  mainThumb ?? (fragments[0] ? thumbUrl(fragments[0]) : null);
                return (
                  <li
                    key={g.seriesKey}
                    className="rounded-xl border border-zinc-200/90 bg-white/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 sm:p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          {previewThumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewThumb}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                            {g.main?.title ?? "Серия без основной композиции"}
                          </p>
                          <p className="mt-1 break-words text-xs leading-snug text-zinc-500">
                            Ключ:{" "}
                            <span className="break-all font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                              {g.seriesKey}
                            </span>
                            {" · "}
                            {fragments.length}{" "}
                            {fragments.length === 1 ? "фрагмент" : "фрагментов"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-zinc-200/70 pt-2.5 dark:border-zinc-700/70">
                        {g.main ? (
                          <Link
                            href={`/admin/artworks/${encodeURIComponent(g.main.slug)}`}
                            className={btnSecondary}
                          >
                            Композиция
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/artworks/new?series=${encodeURIComponent(g.seriesKey)}`}
                          className={btnSecondary}
                        >
                          Добавить фрагмент
                        </Link>
                      </div>
                    </div>
                    {fragments.length ? (
                      <ul className="mt-2 space-y-1.5 rounded-lg border border-zinc-200/60 bg-zinc-50/70 p-2 dark:border-zinc-700/60 dark:bg-zinc-950/40">
                        {fragments.map((f) => (
                          <ArtworkRow
                            key={f.id}
                            a={f}
                            subtitle={
                              <>
                                Фрагмент · {f.status} · {f.slug}
                              </>
                            }
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-500">
                        Фрагментов пока нет — добавьте первый кадр серии.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {standaloneCollections.length ? (
              <div className="mt-8">
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Записи без ключа серии
                </h3>
                <p className="mb-3 text-xs text-zinc-500">
                  Для интерактивной серии задайте одинаковый ключ у композиции и
                  фрагментов или создайте коллекцию кнопкой выше.
                </p>
                <ul className="space-y-2">
                  {standaloneCollections.map((a) => (
                    <ArtworkRow key={a.id} a={a} />
                  ))}
                </ul>
              </div>
            ) : null}

            {collectionRows.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                В коллекции пока нет записей.
              </p>
            ) : null}
          </section>
        </div>

        {artworks.length === 0 ? (
          <p className="mt-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Пока нет записей — добавьте работу или коллекцию.
          </p>
        ) : null}
      </div>
    </div>
  );
}
