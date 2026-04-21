"use client";

import type { ChangeEventHandler } from "react";
import type { UseFormRegister } from "react-hook-form";

import { fieldClass, labelClass } from "./constants";
import type { ArtworkFormInitial } from "./types";

type Props = {
  isCollection: boolean;
  isFragmentCreate: boolean;
  wantAutoSeriesKey: boolean;
  lockSectionField: boolean;
  showComposite: boolean;
  mode: "create" | "edit";
  register: UseFormRegister<ArtworkFormInitial>;
  onSectionChange: ChangeEventHandler<HTMLSelectElement>;
};

export function ArtworkSettingsSection({
  isCollection,
  isFragmentCreate,
  wantAutoSeriesKey,
  lockSectionField,
  showComposite,
  register,
  onSectionChange,
}: Props) {
  return (
    <>
      <section className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
          Параметры полотна
        </h2>

        <label className={labelClass}>
          <span>Цена, ₽</span>
          <p className="mt-0.5 text-xs font-normal leading-snug text-zinc-500 dark:text-zinc-400">
            Пустое поле — цена на лендинге не показывается.
          </p>
          <input
            type="number"
            min={0}
            step={1}
            className={fieldClass}
            placeholder="например 45000"
            {...register("priceRub", {
              setValueAs: (v) => {
                if (v === "" || v === undefined || v === null) return null;
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : null;
              },
            })}
          />
        </label>

        {lockSectionField ? <input type="hidden" {...register("section")} /> : null}

        <div
          className={`grid grid-cols-1 gap-3 ${
            lockSectionField ? "" : "sm:grid-cols-2"
          }`}
        >
          {!lockSectionField ? (
            <label className={labelClass}>
              <span>Секция</span>
              <select
                className={fieldClass}
                {...register("section", { onChange: onSectionChange })}
              >
                <option value="works">Работы (слайдер 3D)</option>
                <option value="collection">Коллекция</option>
              </select>
            </label>
          ) : null}
          <label className={labelClass}>
            <span>Статус</span>
            <select className={fieldClass} {...register("status")}>
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
              <option value="sold">Продано</option>
              <option value="reserved">Резерв</option>
            </select>
          </label>
        </div>

        <label className={labelClass}>
          <span>
            Aspect ratio
            {isCollection
              ? " (опционально; если пусто — на сайте 2/3)"
              : " (опционально)"}
          </span>
          <input
            className={fieldClass}
            placeholder="2/3"
            {...register("aspectRatio")}
          />
        </label>
      </section>

      {showComposite &&
      !isFragmentCreate &&
      !(wantAutoSeriesKey && isCollection) ? (
        <label className="flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/70 px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200">
          <input type="checkbox" {...register("isCollectionComposite")} />
          <span>Общая композиция (большое фото с мольбертом)</span>
        </label>
      ) : null}

      {isCollection && !isFragmentCreate && !wantAutoSeriesKey ? (
        <label className={labelClass}>
          <span>Ключ серии (латиница, без пробелов)</span>
          <input
            className={`${fieldClass} font-mono`}
            placeholder="naturmort-1"
            {...register("collectionSeriesKey")}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Одно и то же значение у <span className="font-medium">общей композиции</span> и{" "}
            <span className="font-medium">каждого фрагмента</span> этой интерактивной
            коллекции — тогда на сайте они не смешаются с другой серией, даже если в
            списке перемешан порядок. Для одной серии на сайте можно оставить пустым
            (тогда используется порядок в списке как раньше).
          </p>
        </label>
      ) : null}

      {(isFragmentCreate || wantAutoSeriesKey) && isCollection ? (
        <input type="hidden" {...register("collectionSeriesKey")} />
      ) : null}
    </>
  );
}
