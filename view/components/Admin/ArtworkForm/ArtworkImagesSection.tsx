"use client";

import type { ChangeEventHandler } from "react";
import type { UseFormRegister } from "react-hook-form";

import { fieldClass, labelClass } from "./constants";
import type { ArtworkFormInitial } from "./types";

type Props = {
  mode: "create" | "edit";
  uploadBusy: boolean;
  loading: boolean;
  previewUrls: string[];
  register: UseFormRegister<ArtworkFormInitial>;
  onPickImage: ChangeEventHandler<HTMLInputElement>;
};

export function ArtworkImagesSection({
  mode,
  uploadBusy,
  loading,
  previewUrls,
  register,
  onPickImage,
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
          JPEG, PNG, WebP или GIF, до 15 МБ. Файл сохранится в{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.7rem] dark:bg-zinc-800">
            /public/uploads/artworks
          </code>
          .
        </p>
      </div>

      {previewUrls.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Превью: первое изображение — основной план, далее детали.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {previewUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100/60 dark:border-zinc-700 dark:bg-zinc-900/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Предпросмотр ${idx + 1}`}
                  className="mx-auto h-28 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <label className={labelClass}>
        <span>URL изображений (каждый с новой строки)</span>
        <textarea
          rows={4}
          className={`${fieldClass} font-mono`}
          placeholder={"/uploads/artworks/main.jpg\n/uploads/artworks/detail-1.jpg"}
          {...register("imageUrlsText")}
        />
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          Первое изображение используется как главный план в 3D-блоке, остальные
          показываются как детали.
        </p>
      </label>

      <label className={labelClass}>
        <span>
          URL главной картинки (legacy, можно оставить пустым) (
          {mode === "create"
            ? "если не загружали файл — обязательно"
            : "оставьте пустым, чтобы не менять"}
          )
        </span>
        <input
          className={`${fieldClass} font-mono`}
          placeholder="/pictures/example.jpg"
          {...register("imageUrl")}
        />
      </label>
    </section>
  );
}
