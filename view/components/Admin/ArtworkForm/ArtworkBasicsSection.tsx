"use client";

import type { UseFormRegister } from "react-hook-form";

import { fieldClass, labelClass } from "./constants";
import type { ArtworkFormInitial } from "./types";

type Props = {
  mode: "create" | "edit";
  hideCreateDescriptionUi: boolean;
  register: UseFormRegister<ArtworkFormInitial>;
};

export function ArtworkBasicsSection({
  mode,
  hideCreateDescriptionUi,
  register,
}: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
        Основное
      </h2>

      <label className={labelClass}>
        <span>Название</span>
        <input
          required
          className={fieldClass}
          {...register("title", { required: true })}
        />
      </label>

      {mode === "create" ? (
        <>
          <input type="hidden" {...register("slug", { required: true })} />
          <input type="hidden" {...register("alt", { required: true })} />
        </>
      ) : null}

      {mode === "edit" ? (
        <label className={labelClass}>
          <span>Alt</span>
          <input
            required
            className={fieldClass}
            {...register("alt", { required: true })}
          />
        </label>
      ) : null}

      {mode === "create" && hideCreateDescriptionUi ? (
        <input type="hidden" {...register("description", { required: true })} />
      ) : (
        <label className={labelClass}>
          <span>Описание (текст на сайте)</span>
          <textarea
            required
            rows={5}
            className={fieldClass}
            {...register("description", { required: true })}
          />
        </label>
      )}

      <label className={labelClass}>
        <span>Материал / подпись</span>
        <input
          required
          className={fieldClass}
          placeholder="Масло, холст 50×80"
          {...register("medium", { required: true })}
        />
      </label>
    </section>
  );
}
