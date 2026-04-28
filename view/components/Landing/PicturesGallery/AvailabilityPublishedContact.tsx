"use client";

import { useEffect, useId, useRef, useState } from "react";

function ChevronMini({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VK_URL = "https://vk.ru/anntiart";
const INST_URL = "https://www.instagram.com/anntiart/";

type Props = {
  /** По умолчанию отступ сверху как у старой плашки (`mt-2` в карточке работы, `mt-1` у фрагмента). */
  className?: string;
};

/**
 * Плашка «В наличии» с контактами: наведение (десктоп) или нажатие (тач / клавиатура).
 */
export function AvailabilityPublishedContact({
  className = "mt-2",
}: Props = {}) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeHoverTimerRef = useRef<number | null>(null);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);

  const open = hover || pinned;

  useEffect(() => {
    if (!pinned) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [pinned]);

  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  useEffect(() => {
    return () => {
      if (closeHoverTimerRef.current != null) {
        window.clearTimeout(closeHoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeHoverTimerRef.current != null) {
      window.clearTimeout(closeHoverTimerRef.current);
      closeHoverTimerRef.current = null;
    }
    setHover(true);
  };

  const handleMouseLeave = () => {
    if (closeHoverTimerRef.current != null) {
      window.clearTimeout(closeHoverTimerRef.current);
    }
    closeHoverTimerRef.current = window.setTimeout(() => {
      setHover(false);
      closeHoverTimerRef.current = null;
    }, 220);
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex max-w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-controls={`${panelId}-panel`}
        aria-haspopup="dialog"
        aria-label="В наличии — контакты для связи и условия покупки"
        onClick={(e) => {
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-emerald-400/55 bg-emerald-50/90 px-2.5 py-1 text-left text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-emerald-950 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset] outline-none ring-emerald-400/35 transition hover:border-emerald-500/65 hover:bg-emerald-100/95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-emerald-500/40 dark:bg-emerald-950/55 dark:text-emerald-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-emerald-500/35 dark:focus-visible:ring-offset-zinc-950"
      >
        <span className="min-w-0">В наличии</span>
        <ChevronMini
          className={`shrink-0 opacity-75 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`${panelId}-panel`}
        role="dialog"
        aria-labelledby={`${panelId}-title`}
        aria-hidden={!open}
        className={`absolute left-0 top-[calc(100%-1px)] z-[90] mt-0 w-[min(20.5rem,calc(100vw-2rem))] origin-top-left rounded-2xl border border-zinc-200/95 bg-white/98 p-4 text-left text-sm leading-snug text-zinc-800 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45),0_0_0_1px_rgba(255,255,255,0.85)_inset] backdrop-blur-md transition-[opacity,transform] duration-200 ease-out dark:border-zinc-600 dark:bg-zinc-900/98 dark:text-zinc-100 dark:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)] ${
          open
            ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        <p
          id={`${panelId}-title`}
          className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400"
        >
          Контакты для связи
        </p>
        <ul className="mt-3 space-y-2.5">
          <li>
            <a
              href={VK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline decoration-zinc-400/80 underline-offset-2 transition hover:text-zinc-950 hover:decoration-zinc-600 dark:text-zinc-50 dark:decoration-zinc-500 dark:hover:text-white"
            >
              vk.ru/anntiart
            </a>
          </li>
          <li>
            <a
              href={INST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline decoration-zinc-400/80 underline-offset-2 transition hover:text-zinc-950 hover:decoration-zinc-600 dark:text-zinc-50 dark:decoration-zinc-500 dark:hover:text-white"
            >
              Inst @anntiart
            </a>
          </li>
        </ul>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[0.8125rem] text-zinc-600 dark:text-zinc-300">
          <li>Покупка готовой картины</li>
          <li>Создание картины по вашим предпочтениям</li>
          <li>Предложения по сотрудничеству</li>
        </ul>
      </div>
    </div>
  );
}
