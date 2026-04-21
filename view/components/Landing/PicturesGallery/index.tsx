"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { STATIC_WORKS_META } from "view/constants/works-meta";
import { partitionCollectionSeries } from "view/lib/collection-series";
import { formatPriceRub } from "view/lib/format-price";

import { WorksGallery3D } from "../WorksGallery3D";
import { ArtworkMasonryGrid } from "./ArtworkMasonryGrid";
import { CollectionInteractive } from "./CollectionInteractive";
import { GalleryWorkNav } from "./GalleryWorkNav";
import {
  buildMasonryPhotos,
  COLLECTION_SECTION_INTRO,
  FALLBACK_COLLECTION,
  FALLBACK_WORKS,
  getWorkMetaFallback,
  type PicturesGalleryProps,
  seriesHeading,
} from "./shared";

gsap.registerPlugin(ScrollTrigger);

export type { PicturesGalleryProps } from "./shared";

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
    () => workMeta[activeWork?.id] ?? getWorkMetaFallback(activeWork),
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
  const masonryPhotos = useMemo(
    () => buildMasonryPhotos(works, collectionItems, workMeta, collectionMeta),
    [works, collectionItems, workMeta, collectionMeta],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const card = noteRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 26,
          x: 16,
          filter: "blur(4px)",
        },
        {
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
        },
      );
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

        <ArtworkMasonryGrid photos={masonryPhotos} />

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
                        setCollectionSlideIdx((i) => (i + 1) % collectionSeries.length)
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
