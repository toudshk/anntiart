"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { AdminDeleteArtworkButton } from "view/components/Admin/AdminDeleteArtworkButton";
import type { AdminArtworkListItem } from "view/lib/admin-collection-groups";

const btnSecondary =
  "inline-flex items-center justify-center rounded-full border border-zinc-400/80 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-800 shadow-xs transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:border-zinc-400 dark:hover:bg-zinc-700";

const btnReorder =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300/90 bg-zinc-50 text-zinc-700 transition hover:border-zinc-400 hover:bg-white disabled:pointer-events-none disabled:opacity-30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700";

function thumbUrl(a: AdminArtworkListItem): string | null {
  return a.images[0]?.url ?? null;
}

type Props = {
  items: AdminArtworkListItem[];
};

export function AdminWorksReorderList({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const persistOrder = useCallback(
    (orderedSlugs: string[]) => {
      startTransition(async () => {
        try {
          const r = await fetch("/api/admin/artworks/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: "works", orderedSlugs }),
          });
          if (r.ok) {
            router.refresh();
          }
        } catch {
          /* ignore */
        }
      });
    },
    [router],
  );

  const move = (index: number, delta: -1 | 1) => {
    const j = index + delta;
    if (j < 0 || j >= items.length) return;
    const next = items.map((x) => x.slug);
    [next[index], next[j]] = [next[j]!, next[index]!];
    persistOrder(next);
  };

  return (
    <ul className="space-y-2">
      {items.map((a, idx) => {
        const thumb = thumbUrl(a);
        return (
          <li
            key={a.id}
            className="grid grid-cols-[auto_3.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/90 p-3 shadow-sm sm:grid-cols-[auto_3.5rem_minmax(0,1fr)_auto] sm:gap-3 dark:border-zinc-700 dark:bg-zinc-900/80"
          >
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                className={btnReorder}
                disabled={pending || idx === 0}
                onClick={() => move(idx, -1)}
                aria-label="Выше в списке"
                title="Выше"
              >
                <span aria-hidden className="text-sm leading-none">
                  ↑
                </span>
              </button>
              <button
                type="button"
                className={btnReorder}
                disabled={pending || idx === items.length - 1}
                onClick={() => move(idx, 1)}
                aria-label="Ниже в списке"
                title="Ниже"
              >
                <span aria-hidden className="text-sm leading-none">
                  ↓
                </span>
              </button>
            </div>
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
                Работы · {a.status} · {a.slug}
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
      })}
    </ul>
  );
}
