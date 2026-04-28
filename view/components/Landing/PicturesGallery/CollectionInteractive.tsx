"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { PictureItem } from "view/constants/pictures";
import { artworkStatusLabel, type WorkMeta } from "view/constants/works-meta";
import { formatPriceRub } from "view/lib/format-price";
import { shouldUseUnoptimizedNextImage } from "view/lib/artwork-image-url";

import { AvailabilityPublishedContact } from "./AvailabilityPublishedContact";

type Props = {
  main: PictureItem | null;
  related: PictureItem[];
  collectionMeta?: Record<string, WorkMeta>;
};

export function CollectionInteractive({
  main,
  related,
  collectionMeta = {},
}: Props) {
  const [activeId, setActiveId] = useState<string>(related[0]?.id ?? "");

  useEffect(() => {
    if (related.length === 0) return;
    if (!related.some((r) => r.id === activeId)) {
      setActiveId(related[0]!.id);
    }
  }, [related, activeId]);

  const activePicture =
    related.find((item) => item.id === activeId) ?? related[0] ?? null;

  if (!main) return null;

  const activeHotspot = activePicture?.hotspot ?? null;
  const activeIdx = Math.max(
    0,
    related.findIndex((item) => item.id === activeId),
  );
  const activeFragmentMeta = activePicture
    ? collectionMeta[activePicture.id]
    : undefined;

  return (
    <div
      className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-br from-white/85 via-pastel-gray-50/65 to-pastel-gray-100/55 px-4 py-4 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-8 sm:py-8 dark:border-zinc-700/80 dark:from-zinc-900/75 dark:via-zinc-900/55 dark:to-zinc-950/45 dark:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-labelledby="collection-interactive-label"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pastel-gray-200/35 blur-3xl dark:bg-zinc-600/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-pastel-beige-100/30 blur-3xl dark:bg-zinc-700/10"
        aria-hidden
      />

      <p id="collection-interactive-label" className="sr-only">
        Интерактивный просмотр серии «Черновики личности»: слева общая композиция, справа
        увеличенный фрагмент.
      </p>

      <div className="relative mx-auto grid w-full min-h-0 max-w-6xl grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:gap-y-6">
        <div className="flex min-h-0 min-w-0 flex-col gap-2 lg:gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Общая композиция
            </p>
            <span className="rounded-full border border-zinc-200/90 bg-white/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-zinc-600 shadow-sm dark:border-zinc-600/80 dark:bg-zinc-800/70 dark:text-zinc-300">
              Нажмите на работы
            </span>
          </div>

          <figure className="group relative mx-auto max-h-[46svh] w-full overflow-hidden rounded-2xl border border-zinc-300/75 bg-zinc-100/40 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/50 max-lg:max-w-full lg:max-h-none dark:border-zinc-600/70 dark:bg-zinc-950/35 dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)] dark:ring-white/5">
            <div
              className="relative mx-auto w-full max-w-full cursor-pointer max-lg:max-h-[46svh]"
              style={{ aspectRatio: main.aspectRatio ?? "4/3" }}
            >
              <Image
                key={`${main.id}:${main.src}`}
                src={main.src}
                alt={main.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 62rem"
                unoptimized={shouldUseUnoptimizedNextImage(main.src)}
                className="object-cover transition-[filter] duration-500 group-hover:brightness-[1.02] pointer-events-none"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/10 via-transparent to-zinc-900/[0.07] dark:from-black/25 dark:to-black/10"
                aria-hidden
              />
              {related.map((item) => {
                const hs = item.hotspot;
                if (!hs) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    aria-label={`Показать ${item.alt}`}
                    aria-current={item.id === activeId ? "true" : undefined}
                    className="absolute z-20 cursor-pointer rounded-xl transition-all duration-500 ease-out hover:scale-[1.03] hover:bg-white/16 focus-visible:scale-[1.03] focus-visible:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/80 dark:focus-visible:outline-zinc-500"
                    style={{
                      left: `${hs.x}%`,
                      top: `${hs.y}%`,
                      width: `${hs.w}%`,
                      height: `${hs.h}%`,
                    }}
                  />
                );
              })}
              {activeHotspot ? (
                <span
                  key={activeId}
                  className="pointer-events-none absolute z-10 rounded-xl bg-white/16 shadow-[0_0_18px_rgba(255,255,255,0.42),0_12px_26px_-18px_rgba(15,23,42,0.45)] transition-all duration-700 ease-out animate-[pulse_4.8s_ease-in-out_infinite]"
                  style={{
                    left: `${activeHotspot.x + activeHotspot.w * 0.14}%`,
                    top: `${activeHotspot.y + activeHotspot.h * 0.14}%`,
                    width: `${activeHotspot.w * 0.72}%`,
                    height: `${activeHotspot.h * 0.72}%`,
                  }}
                />
              ) : null}
            </div>
            <figcaption className="sr-only">{main.alt}</figcaption>
          </figure>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col justify-between gap-3 lg:gap-5">
          <div className="flex flex-wrap items-start justify-between gap-2 lg:gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Фрагмент
              </p>
              <p
                className="max-w-[22rem] text-base font-semibold leading-snug tracking-tight text-zinc-900 lg:text-lg dark:text-zinc-100"
                aria-live="polite"
              >
                {activeFragmentMeta?.title ??
                  activePicture?.alt ??
                  "Выберите область слева"}
              </p>
              {activeFragmentMeta?.medium ? (
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                  {activeFragmentMeta.medium}
                </p>
              ) : null}
              {artworkStatusLabel(activeFragmentMeta?.status) ? (
                activeFragmentMeta?.status === "published" ? (
                  <AvailabilityPublishedContact className="mt-1" />
                ) : (
                  <p className="mt-1 inline-flex rounded-full border border-zinc-200/90 bg-white/70 px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200">
                    {artworkStatusLabel(activeFragmentMeta?.status)}
                  </p>
                )
              ) : null}
              {activeFragmentMeta?.priceRub != null ? (
                <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                  {formatPriceRub(activeFragmentMeta.priceRub)}
                </p>
              ) : null}
              {activeFragmentMeta?.text &&
              activeFragmentMeta.text !== activeFragmentMeta.title ? (
                <p className="mt-1 max-w-[22rem] text-sm leading-relaxed text-zinc-600 line-clamp-2 lg:line-clamp-4 dark:text-zinc-400">
                  {activeFragmentMeta.text}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 tabular-nums rounded-lg border border-zinc-200/90 bg-white/55 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-600/80 dark:bg-zinc-800/60 dark:text-zinc-300">
              {activeIdx + 1}
              <span className="text-zinc-400 dark:text-zinc-500">/</span>
              {related.length}
            </span>
          </div>

          <figure className="relative mx-auto w-full max-w-[min(100%,28rem)] shrink-0 overflow-hidden rounded-2xl border border-zinc-300/70 bg-gradient-to-b from-white/90 to-pastel-gray-50/80 p-1 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.4)] max-lg:max-w-full dark:border-zinc-600/75 dark:from-zinc-800/90 dark:to-zinc-950/80 dark:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.55)] sm:p-1.5 lg:max-w-none">
            <div className="relative aspect-square w-full overflow-hidden rounded-[0.85rem] ring-1 ring-inset ring-zinc-900/5 dark:ring-white/10">
              {activePicture ? (
                <div className="relative h-full w-full">
                  <Image
                    key={`${activePicture.id}:${activePicture.src}`}
                    src={activePicture.src}
                    alt={activePicture.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 42vw, 36rem"
                    unoptimized={shouldUseUnoptimizedNextImage(activePicture.src)}
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
            <figcaption className="sr-only">
              {activePicture?.alt ?? "Выбранная мини-картина серии"}
            </figcaption>
          </figure>

          <div className="flex flex-col gap-2 border-t border-zinc-200/70 pt-3 dark:border-zinc-600/50 lg:gap-3 lg:pt-4">
            <div
              className="flex flex-wrap items-center gap-2"
              aria-label="Фрагменты серии «Черновики личности»"
            >
              {related.map((item, idx) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                    aria-pressed={isActive}
                    aria-label={`Показать фрагмент ${idx + 1}: ${item.alt}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "scale-125 bg-zinc-900 shadow-[0_0_0_3px_rgba(24,24,27,0.12)] dark:bg-zinc-100 dark:shadow-[0_0_0_3px_rgba(255,255,255,0.14)]"
                        : "bg-zinc-300/95 hover:scale-110 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Нажмите на фрагмент слева или выберите точку ниже — справа откроется
              соответствующее полотно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
