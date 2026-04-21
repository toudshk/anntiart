"use client";

import { useEffect, useState } from "react";

import type { MasonryPhoto } from "./shared";

type Props = {
  photos: MasonryPhoto[];
};

export function ArtworkMasonryGrid({ photos }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (activeIdx == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIdx(null);
      } else if (e.key === "ArrowRight") {
        setActiveIdx((v) => (v == null ? 0 : (v + 1) % photos.length));
      } else if (e.key === "ArrowLeft") {
        setActiveIdx((v) => (v == null ? 0 : (v - 1 + photos.length) % photos.length));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIdx, photos.length]);

  const activePhoto = activeIdx != null ? photos[activeIdx] : null;

  if (photos.length === 0) return null;

  return (
    <>
      <section className="mt-12 space-y-5" aria-labelledby="artwork-masonry-heading">
        <header className="space-y-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Архив фотографий
          </p>
          <h4
            id="artwork-masonry-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Все фото работ и коллекции
          </h4>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Крупные планы, детали, фрагменты и общие композиции. Нажмите на фото, чтобы
            открыть его на тёмном фоне.
          </p>
        </header>

        <div className="columns-2 gap-4 md:columns-3 xl:columns-4">
          {photos.map((photo, idx) => (
            <button
              key={photo.key}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/70 text-left shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-22px_rgba(15,23,42,0.45)] dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:shadow-[0_16px_30px_-22px_rgba(0,0,0,0.55)]"
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-auto w-full transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="space-y-1 px-3 py-3">
                <span className="inline-flex rounded-full border border-zinc-200/90 bg-white/70 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300">
                  {photo.category}
                </span>
                <p className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {photo.alt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/84 p-4 backdrop-blur-sm"
          onClick={() => setActiveIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
        >
          <button
            type="button"
            onClick={() => setActiveIdx(null)}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15"
            aria-label="Закрыть увеличенное фото"
          >
            Закрыть
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((v) => (v == null ? 0 : (v - 1 + photos.length) % photos.length));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/15"
                aria-label="Предыдущее фото"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((v) => (v == null ? 0 : (v + 1) % photos.length));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/15"
                aria-label="Следующее фото"
              >
                →
              </button>
            </>
          ) : null}

          <figure
            className="max-h-full max-w-[min(92vw,1180px)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-[0_32px_64px_-28px_rgba(0,0,0,0.8)]"
            />
            <figcaption className="mt-3 text-center text-sm text-white/88">
              <span className="font-medium">{activePhoto.title}</span>
              <span className="mx-2 text-white/45">•</span>
              <span>{activePhoto.alt}</span>
              <span className="mx-2 text-white/45">•</span>
              <span>
                {activeIdx! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
