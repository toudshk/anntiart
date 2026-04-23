"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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

const navIconBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300/90 bg-gradient-to-b from-white to-zinc-50/95 text-zinc-700 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] transition hover:border-zinc-400/95 hover:text-zinc-900 hover:shadow-[0_6px_18px_-6px_rgba(15,23,42,0.22)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/80 disabled:pointer-events-none disabled:opacity-35 dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900/95 dark:text-zinc-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_18px_-6px_rgba(0,0,0,0.45)] dark:hover:border-zinc-500 dark:hover:text-white";

const workPickerTriggerClass =
  "grid h-9 min-h-9 max-h-9 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-full border border-zinc-300/90 bg-white/85 px-3 text-left text-sm font-medium leading-none text-zinc-700 shadow-[0_1px_3px_rgba(15,23,42,0.08)] outline-none transition hover:border-zinc-400 data-[state=open]:border-zinc-400 data-[state=open]:shadow-sm dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:border-zinc-500 dark:data-[state=open]:border-zinc-500";

const workMenuContentClass =
  "z-[100] max-h-[min(22rem,52svh)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.8)_inset] [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-600/90 dark:bg-zinc-900 dark:shadow-[0_22px_50px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] [&::-webkit-scrollbar]:hidden";

const workMenuItemBase =
  "mb-0.5 flex w-full cursor-pointer select-none items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-[0.8125rem] font-medium leading-snug outline-none transition-colors last:mb-0";

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
  const activeWork = works[activeIndex] ?? null;
  const activeTitle = activeWork ? (workMeta[activeWork.id]?.title ?? activeWork.id) : "Работ нет";

  return (
    <div className="relative isolate flex w-full min-w-0 flex-nowrap items-center gap-2 sm:gap-2.5">
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

      <div className="min-w-0 flex-1 sm:hidden">
        <div
          className="grid h-9 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-full border border-zinc-200/90 bg-white/75 px-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900/65"
          title={activeTitle}
        >
          <p className="min-w-0 truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {activeTitle}
          </p>
          <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
            {works.length ? `${activeIndex + 1}/${works.length}` : "0/0"}
          </span>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center gap-2 overflow-hidden sm:flex">
        <span className="shrink-0 tabular-nums rounded-full border border-zinc-200/90 bg-white/75 px-2.5 py-1 text-xs font-medium leading-none text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/65 dark:text-zinc-300">
          {works.length ? `${activeIndex + 1}/${works.length}` : "0/0"}
        </span>
        <div className="min-w-0 flex-1">
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild disabled={disabled}>
              <button
                type="button"
                title={activeTitle}
                className={workPickerTriggerClass}
                aria-label="Выбрать работу"
              >
                <span className="min-w-0 truncate text-left">{activeTitle}</span>
                <span
                  className="pointer-events-none shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
                  aria-hidden
                >
                  ▼
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                data-lenis-prevent-wheel=""
                side="bottom"
                align="start"
                sideOffset={6}
                collisionPadding={12}
                className={workMenuContentClass}
              >
                {works.map((w, idx) => {
                  const label = workMeta[w.id]?.title ?? w.id;
                  const selected = idx === activeIndex;
                  return (
                    <DropdownMenu.Item
                      key={w.id}
                      className={
                        selected
                          ? `${workMenuItemBase} bg-zinc-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:data-[highlighted]:bg-zinc-200 dark:data-[highlighted]:text-zinc-900`
                          : `${workMenuItemBase} text-zinc-700 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-zinc-200 dark:data-[highlighted]:bg-zinc-800/90 dark:data-[highlighted]:text-zinc-50`
                      }
                      onSelect={() => setActiveIndex(idx)}
                    >
                      <span className="min-w-0 flex-1 truncate pr-1">{label}</span>
                      <span
                        className={
                          selected
                            ? "shrink-0 min-w-[1.75rem] text-right text-[0.7rem] tabular-nums tracking-tight text-white/75 dark:text-zinc-600"
                            : "shrink-0 min-w-[1.75rem] text-right text-[0.7rem] tabular-nums tracking-tight text-zinc-400 dark:text-zinc-500"
                        }
                      >
                        {idx + 1}
                      </span>
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
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
