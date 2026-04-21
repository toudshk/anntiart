"use client";

import type { Dispatch, SetStateAction } from "react";

import type { PictureItem } from "view/constants/pictures";
import type { WorkMeta } from "view/constants/works-meta";

type Props = {
  works: PictureItem[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  workMeta: Record<string, WorkMeta>;
};

export function GalleryWorkNav({
  works,
  activeIndex,
  setActiveIndex,
  workMeta,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => setActiveIndex((v) => (v - 1 + works.length) % works.length)}
        className="rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
      >
        Назад
      </button>
      {works.map((w, idx) => (
        <button
          key={w.id}
          type="button"
          onClick={() => setActiveIndex(idx)}
          className={
            idx === activeIndex
              ? "rounded-md border border-zinc-900 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
          }
        >
          {workMeta[w.id]?.title ?? w.id}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setActiveIndex((v) => (v + 1) % works.length)}
        className="rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
      >
        Вперёд
      </button>
    </div>
  );
}
