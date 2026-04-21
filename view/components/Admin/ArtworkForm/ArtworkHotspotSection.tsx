"use client";

import type { Dispatch, SetStateAction } from "react";
import type { UseFormRegister } from "react-hook-form";

import type { AdminArtworkSummary } from "view/requests";

import { CollectionHotspotEditor } from "../CollectionHotspotEditor";
import { fieldClass, labelClass } from "./constants";
import type { ArtworkFormInitial } from "./types";

type Props = {
  showHotspots: boolean;
  isFragmentCreate: boolean;
  matchedParentComposite: AdminArtworkSummary | null;
  composites: AdminArtworkSummary[];
  compositionPickSlug: string;
  setCompositionPickSlug: Dispatch<SetStateAction<string>>;
  manualCompositionUrl: string;
  setManualCompositionUrl: Dispatch<SetStateAction<string>>;
  compositionGuideUrl: string;
  compositionBoxAspect: string;
  values: ArtworkFormInitial;
  register: UseFormRegister<ArtworkFormInitial>;
  onHotspotEditorChange: (v: { x: number; y: number; w: number; h: number }) => void;
  onResetHotspot: () => void;
  parseOptionalNumber: (v: string) => number | null;
};

export function ArtworkHotspotSection({
  showHotspots,
  isFragmentCreate,
  matchedParentComposite,
  composites,
  compositionPickSlug,
  setCompositionPickSlug,
  manualCompositionUrl,
  setManualCompositionUrl,
  compositionGuideUrl,
  compositionBoxAspect,
  values,
  register,
  onHotspotEditorChange,
  onResetHotspot,
  parseOptionalNumber,
}: Props) {
  if (!showHotspots) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-600 dark:text-zinc-300">
          Hotspot на общей композиции, %
        </p>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {isFragmentCreate && matchedParentComposite ? (
            <>
              Используется композиция{" "}
              <span className="font-medium">{matchedParentComposite.title}</span>.
              Обведите на превью область этого фрагмента — координаты подставятся в
              поля ниже. На сайте те же пропорции и{" "}
              <span className="font-medium">object-cover</span>, что на лендинге.
            </>
          ) : (
            <>
              Сначала укажите то же изображение, что загружено у записи с опцией
              «общая композиция» (выберите её в списке или вставьте URL). Затем
              обведите на превью область этого фрагмента — координаты подставятся в
              поля ниже. На сайте используются те же пропорции блока и{" "}
              <span className="font-medium">object-cover</span>, что и на лендинге.
            </>
          )}
        </p>
      </div>

      {isFragmentCreate && matchedParentComposite ? (
        <p className="rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300">
          Общая композиция подключена из базы:{" "}
          <span className="font-mono">{matchedParentComposite.slug}</span>
        </p>
      ) : null}

      {!(isFragmentCreate && matchedParentComposite) ? (
        <>
          <label className={labelClass}>
            <span>Общая композиция из базы</span>
            <select
              className={fieldClass}
              value={compositionPickSlug}
              onChange={(e) => setCompositionPickSlug(e.target.value)}
            >
              <option value="">— не выбрано —</option>
              {composites.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({c.slug})
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Или URL изображения композиции (имеет приоритет над списком)</span>
            <input
              type="text"
              className={`${fieldClass} font-mono`}
              placeholder="/uploads/artworks/… или /pictures/collection/…"
              value={manualCompositionUrl}
              onChange={(e) => setManualCompositionUrl(e.target.value)}
            />
          </label>
        </>
      ) : null}

      {isFragmentCreate && !matchedParentComposite && composites.length > 0 ? (
        <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Запись с общей композицией и тем же ключом серии в базе не найдена —
          выберите композицию в списке или вставьте URL изображения выше.
        </p>
      ) : null}

      {compositionGuideUrl ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Рамка на превью (перетаскивание и ручки по углам)
          </p>
          <CollectionHotspotEditor
            key={`${compositionGuideUrl}|${compositionBoxAspect}`}
            compositionSrc={compositionGuideUrl}
            boxAspect={compositionBoxAspect}
            x={values.hotspotX}
            y={values.hotspotY}
            w={values.hotspotW}
            h={values.hotspotH}
            onChange={onHotspotEditorChange}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Выберите общую композицию из списка или вставьте её URL — появится
          интерактивная разметка.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <p className="col-span-2 text-xs text-zinc-600 dark:text-zinc-400">
          Поля x, y, ширина и высота (проценты от блока композиции) — можно
          уточнить вручную.
        </p>
        {(
          [
            ["hotspotX", "X"],
            ["hotspotY", "Y"],
            ["hotspotW", "Ширина %"],
            ["hotspotH", "Высота %"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-200"
          >
            {label}
            <input
              type="number"
              step="0.1"
              className={fieldClass}
              {...register(key, {
                setValueAs: parseOptionalNumber,
              })}
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        className="rounded-lg border border-zinc-300/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        onClick={onResetHotspot}
      >
        Сбросить область
      </button>
    </div>
  );
}
