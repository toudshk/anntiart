"use client";

import type { Dispatch, SetStateAction } from "react";

import type { PictureItem } from "view/constants/pictures";
import type { WorkMeta } from "view/constants/works-meta";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Как у переключателя в 3D-блоке: лёгкая «бумага», без чёрных дисков. */
const navIconBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300/90 bg-gradient-to-b from-white to-zinc-50/95 text-zinc-700 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] transition hover:border-zinc-400/95 hover:text-zinc-900 hover:shadow-[0_6px_18px_-6px_rgba(15,23,42,0.22)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/80 disabled:pointer-events-none disabled:opacity-35 dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900/95 dark:text-zinc-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_18px_-6px_rgba(0,0,0,0.45)] dark:hover:border-zinc-500 dark:hover:text-white";

const chipInactive =
  "max-w-[11rem] truncate rounded-full border border-zinc-200/90 bg-white/65 px-3 py-1.5 text-left text-[0.8125rem] font-medium leading-tight text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-[2px] transition hover:border-zinc-300 hover:bg-white/90 hover:shadow-sm dark:border-zinc-600/85 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/70";

const chipActive =
  "max-w-[11rem] truncate rounded-full border border-zinc-800/90 bg-gradient-to-b from-zinc-800 to-zinc-950 px-3 py-1.5 text-left text-[0.8125rem] font-medium leading-tight text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] dark:border-zinc-100/30 dark:from-zinc-100 dark:to-zinc-200/95 dark:text-zinc-950 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]";

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
  const disabled = works.length === 0;

  return (
    <div className="mb-4 flex flex-nowrap items-center gap-2.5 sm:gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setActiveIndex((v) => (works.length ? (v - 1 + works.length) % works.length : 0))
        }
        className={navIconBtnClass}
        aria-label="Предыдущая работа"
        title="Предыдущая работа"
      >
        <ChevronLeftIcon />
      </button>

      <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2">
        {works.map((w, idx) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={idx === activeIndex ? chipActive : chipInactive}
          >
            {workMeta[w.id]?.title ?? w.id}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setActiveIndex((v) => (works.length ? (v + 1) % works.length : 0))
        }
        className={navIconBtnClass}
        aria-label="Следующая работа"
        title="Следующая работа"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
