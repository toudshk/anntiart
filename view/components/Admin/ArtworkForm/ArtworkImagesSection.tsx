"use client";

import type { ChangeEventHandler } from "react";

type Props = {
  uploadBusy: boolean;
  loading: boolean;
  imageUrls: string[];
  onPickImage: ChangeEventHandler<HTMLInputElement>;
  onRemoveImage: (index: number) => void;
};

export function ArtworkImagesSection({
  uploadBusy,
  loading,
  imageUrls,
  onPickImage,
  onRemoveImage,
}: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
        Изображение
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-300/90 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploadBusy || loading}
            onChange={onPickImage}
          />
          {uploadBusy ? "Загрузка…" : "Выбрать файл"}
        </label>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          JPEG, PNG, WebP или GIF, до 15 МБ. Можно загрузить несколько файлов —
          первое изображение станет основным в 3D-блоке, остальные — деталями.
        </p>
      </div>

      {imageUrls.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Загружено: {imageUrls.length}. Первое — основной план, далее детали.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {imageUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100/60 dark:border-zinc-700 dark:bg-zinc-900/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Изображение ${idx + 1}`}
                  className="mx-auto h-28 w-full object-cover"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onRemoveImage(idx)}
                  className="absolute right-1.5 top-1.5 rounded-lg bg-black/55 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white opacity-0 transition hover:bg-black/75 group-hover:opacity-100 disabled:opacity-40"
                >
                  Удалить
                </button>
                {idx === 0 ? (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
                    Основное
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300/90 px-3 py-4 text-center text-xs text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          Изображения пока не загружены
        </p>
      )}
    </section>
  );
}
