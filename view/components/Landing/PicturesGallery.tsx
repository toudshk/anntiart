"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

import {
  PICTURE_ITEMS,
  type PictureItem,
} from "view/constants/pictures";
import type { WorkMeta } from "view/constants/works-meta";
import { STATIC_WORKS_META } from "view/constants/works-meta";
import { partitionCollectionSeries } from "view/lib/collection-series";
import { formatPriceRub } from "view/lib/format-price";

import { WorksGallery3D } from "./WorksGallery3D";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_WORKS = PICTURE_ITEMS.filter((item) => item.section === "works");
const FALLBACK_COLLECTION = PICTURE_ITEMS.filter(
  (item) => item.section === "collection",
);

export type PicturesGalleryProps = {
  works?: PictureItem[];
  collection?: PictureItem[];
  workMeta?: Record<string, WorkMeta>;
  collectionMeta?: Record<string, WorkMeta>;
};

const COLLECTION_SECTION_INTRO =
  "Одна сцена на мольберте объединяет несколько эскизов — проведите курсором по композиции, чтобы увидеть каждую мини-картину отдельно.";

function GalleryWorkNav({
  works,
  activeIndex,
  setActiveIndex,
  workMeta,
}: {
  works: PictureItem[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  workMeta: Record<string, WorkMeta>;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() =>
          setActiveIndex((v) => (v - 1 + works.length) % works.length)
        }
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

/** Заголовок серии над блоком: из title общей композиции или часть alt до « — ». */
function seriesHeading(main: PictureItem, meta?: WorkMeta): string {
  const raw = meta?.title?.trim() || main.alt;
  const sep = " — ";
  const i = raw.indexOf(sep);
  return i > 0 ? raw.slice(0, i).trim() : raw;
}

function CollectionInteractive({
  main,
  related,
  collectionMeta = {},
}: {
  main: PictureItem | null;
  related: PictureItem[];
  collectionMeta?: Record<string, WorkMeta>;
}) {
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
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[0.85rem] ring-1 ring-inset ring-zinc-900/5 dark:ring-white/10"
            >
              {activePicture ? (
                <div className="relative h-full w-full">
                  <Image
                    key={`${activePicture.id}:${activePicture.src}`}
                    src={activePicture.src}
                    alt={activePicture.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 42vw, 36rem"
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

export function PicturesGallery({
  works: worksProp,
  collection: collectionProp,
  workMeta: workMetaProp,
  collectionMeta: collectionMetaProp,
}: PicturesGalleryProps = {}) {
  const works = worksProp ?? FALLBACK_WORKS;
  const collectionItems = collectionProp ?? FALLBACK_COLLECTION;
  const workMeta = workMetaProp ?? STATIC_WORKS_META;
  const collectionMeta = collectionMetaProp ?? {};

  const collectionSeries = useMemo(
    () => partitionCollectionSeries(collectionItems),
    [collectionItems],
  );

  const [collectionSlideIdx, setCollectionSlideIdx] = useState(0);
  useEffect(() => {
    setCollectionSlideIdx((i) => {
      if (collectionSeries.length === 0) return 0;
      return Math.min(Math.max(i, 0), collectionSeries.length - 1);
    });
  }, [collectionSeries.length]);

  const activeCollectionSlide =
    collectionSeries[collectionSlideIdx] ?? collectionSeries[0] ?? null;

  const rootRef = useRef<HTMLElement>(null);
  const noteRef = useRef<HTMLElement>(null);
  const textLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeWork = works[activeIndex] ?? works[0];
  const activeMeta = useMemo(
    () =>
      workMeta[activeWork?.id] ?? {
        title: activeWork?.alt ?? "Работа",
        medium: "Масло, холст",
        text: "Описание будет добавлено позже.",
      },
    [activeWork, workMeta],
  );
  const activeTextLines = useMemo(
    () =>
      activeMeta.text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [activeMeta.text],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const card = noteRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 26,
        x: 16,
        filter: "blur(4px)",
      }, {
        opacity: 1,
        y: 0,
        x: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
          once: true,
          scroller: document.documentElement,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const card = noteRef.current;
    if (!card) return;
    textLineRefs.current.length = activeTextLines.length;
    const lines = textLineRefs.current.filter(Boolean) as HTMLParagraphElement[];
    gsap.fromTo(
      card,
      { opacity: 0.65, y: 8 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
    );
    if (lines.length) {
      gsap.fromTo(
        lines,
        { opacity: 0, y: 10, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
        },
      );
    }
  }, [activeWork?.id, activeTextLines.length]);

  return (
    <section
      ref={rootRef}
      id="pictures-gallery"
      className="relative z-30 -mt-[min(37vh,19rem)] overflow-x-visible border-0 bg-[linear-gradient(180deg,#e0ded9_0%,#e7e4df_24%,#eceae7_56%,#f6f5f3_100%)] px-6 pb-20 pt-12 dark:bg-[linear-gradient(180deg,#f3f5f7_0%,#3b4249_18%,#242a31_40%,#161b21_62%,#0a0d11_100%)]"
      aria-labelledby="pictures-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[clamp(6rem,16vh,12rem)]"
        style={{
          background:
            "linear-gradient(180deg, #e0ded9 0%, rgba(224,222,217,0.9) 24%, rgba(212,209,203,0.45) 52%, rgba(212,209,203,0) 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-7xl overflow-x-visible overflow-y-visible pt-4">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-8">
          <div className="order-1 w-full lg:order-none lg:col-start-2 lg:row-start-1">
            <GalleryWorkNav
              works={works}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              workMeta={workMeta}
            />
          </div>
          <div className="order-2 w-full lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <WorksGallery3D
              item={activeWork ?? null}
              photoUrls={
                activeWork
                  ? [activeWork.src, ...(activeMeta.detailImageUrls ?? [])]
                  : []
              }
            />
          </div>
          <aside
            data-art-note
            ref={noteRef}
            className="order-3 text-zinc-700 dark:text-zinc-300 lg:order-none lg:col-start-2 lg:row-start-2"
            aria-label={`Описание картины ${activeMeta.title}`}
          >
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {activeMeta.title}
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              {activeMeta.medium}
            </p>
            {activeMeta.priceRub != null ? (
              <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                {formatPriceRub(activeMeta.priceRub)}
              </p>
            ) : null}
            <div className="mt-2 space-y-1.5">
              {activeTextLines.map((line, idx) => (
                <p
                  key={`${activeWork?.id ?? "work"}-${idx}`}
                  ref={(el) => {
                    textLineRefs.current[idx] = el;
                  }}
                  className="text-sm leading-snug"
                >
                  {line}
                </p>
              ))}
            </div>
            {activeMeta.detailImageUrls?.length ? (
              <div className="mt-3 space-y-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                  Детали работы
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {activeMeta.detailImageUrls.slice(0, 6).map((url, idx) => (
                    <div
                      key={`${activeWork?.id ?? "work"}-detail-${idx}`}
                      className="overflow-hidden rounded-lg border border-zinc-200/90 bg-zinc-100/60 dark:border-zinc-700 dark:bg-zinc-900/45"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${activeMeta.title} — деталь ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-20 border-t border-zinc-300/35 pt-16 dark:border-zinc-600/35">
          <header className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Серия мини-картин
            </p>
            <h4
              className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.65rem] dark:text-zinc-50"
              id="collection-heading"
            >
              {activeCollectionSlide
                ? seriesHeading(
                    activeCollectionSlide.main,
                    collectionMeta[activeCollectionSlide.main.id],
                  )
                : "Коллекция"}
            </h4>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {(activeCollectionSlide &&
                collectionMeta[activeCollectionSlide.main.id]?.text?.trim()) ||
                COLLECTION_SECTION_INTRO}
            </p>
            <div
              className="mx-auto h-px w-12 bg-gradient-to-r from-transparent via-zinc-400/70 to-transparent dark:via-zinc-500/60"
              aria-hidden
            />
          </header>
          {activeCollectionSlide ? (
            <div className="space-y-6">
              {collectionSeries.length > 1 ? (
                <div
                  className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
                  role="navigation"
                  aria-label="Выбор коллекции"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionSlideIdx(
                          (i) =>
                            (i - 1 + collectionSeries.length) %
                            collectionSeries.length,
                        )
                      }
                      className="rounded-full border border-zinc-300/90 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Назад
                    </button>
                    <span className="min-w-[4.5rem] tabular-nums text-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {collectionSlideIdx + 1} / {collectionSeries.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionSlideIdx(
                          (i) => (i + 1) % collectionSeries.length,
                        )
                      }
                      className="rounded-full border border-zinc-300/90 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Вперёд
                    </button>
                  </div>
                  <div
                    className="flex flex-wrap justify-center gap-2"
                    role="tablist"
                    aria-label="Коллекции"
                  >
                    {collectionSeries.map((slide, idx) => {
                      const label = seriesHeading(
                        slide.main,
                        collectionMeta[slide.main.id],
                      );
                      return (
                        <button
                          key={slide.main.id}
                          type="button"
                          role="tab"
                          aria-selected={idx === collectionSlideIdx}
                          onClick={() => setCollectionSlideIdx(idx)}
                          className={
                            idx === collectionSlideIdx
                              ? "max-w-[10rem] truncate rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                              : "max-w-[10rem] truncate rounded-full border border-zinc-300/90 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          }
                          title={label}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <CollectionInteractive
                key={activeCollectionSlide.main.id}
                main={activeCollectionSlide.main}
                related={activeCollectionSlide.related}
                collectionMeta={collectionMeta}
              />
            </div>
          ) : collectionItems.some((i) => i.section === "collection") ? (
            <p className="mx-auto max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
              Нужны опубликованная «общая композиция» и хотя бы один фрагмент с hotspot.
              Несколько серий: задайте в админке одинаковый{" "}
              <span className="font-medium">ключ серии</span> у композиции и всех её
              фрагментов — тогда порядок в списке не важен. Иначе — в списке должны идти
              «фрагменты → композиция» или «композиция → фрагменты» для каждой серии.
            </p>
          ) : null}
        </div>
      </div>

    </section>
  );
}
