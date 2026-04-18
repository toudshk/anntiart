"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { aspectRatioFromCm } from "view/lib/aspect-ratio";
import { slugFromTitle } from "view/lib/slug-from-title";
import {
  apiErrorMessage,
  createAdminArtwork,
  deleteAdminArtwork,
  fetchAdminArtworksList,
  patchAdminArtwork,
  uploadAdminArtworkFile,
  type AdminArtworkSummary,
} from "view/requests";

import { CollectionHotspotEditor } from "./CollectionHotspotEditor";

function boxAspectFromSummary(row: AdminArtworkSummary): string {
  if (row.aspectRatio && /^\d+\/\d+$/.test(row.aspectRatio)) {
    return row.aspectRatio;
  }
  if (row.widthCm && row.heightCm) {
    return aspectRatioFromCm(row.widthCm, row.heightCm);
  }
  return "2/3";
}

type ArtworkSection = "works" | "collection";
type ArtworkStatus = "draft" | "published" | "sold" | "reserved";

export type ArtworkFormInitial = {
  slug: string;
  title: string;
  alt: string;
  description: string;
  medium: string;
  widthCm: number | null;
  heightCm: number | null;
  section: ArtworkSection;
  status: ArtworkStatus;
  aspectRatio: string;
  isCollectionComposite: boolean;
  hotspotX: number | null;
  hotspotY: number | null;
  hotspotW: number | null;
  hotspotH: number | null;
  /** Одинаковый ключ у композиции и всех фрагментов одной серии на лендинге. */
  collectionSeriesKey: string;
  imageUrl: string;
};

const emptyCreate = (): ArtworkFormInitial => ({
  slug: "",
  title: "",
  alt: "",
  description: "",
  medium: "",
  widthCm: null,
  heightCm: null,
  section: "works",
  status: "published",
  aspectRatio: "",
  isCollectionComposite: false,
  hotspotX: null,
  hotspotY: null,
  hotspotW: null,
  hotspotH: null,
  collectionSeriesKey: "",
  imageUrl: "",
});

/** Параметры ссылки «Новая работа / новая коллекция / фрагмент». */
export type ArtworkCreatePreset = {
  section?: ArtworkSection;
  isCollectionComposite?: boolean;
  collectionSeriesKey?: string;
  /** Сгенерировать уникальный ключ серии (для «Добавить коллекцию»). */
  autoCollectionSeriesKey?: boolean;
};

/** Создание фрагмента по ссылке «Добавить фрагмент» (?series=…). */
function isFragmentCreatePreset(
  preset: ArtworkCreatePreset | undefined,
): boolean {
  return Boolean(
    preset &&
      preset.collectionSeriesKey?.trim() &&
      preset.isCollectionComposite === false &&
      !preset.autoCollectionSeriesKey,
  );
}

function mergeCreateDefaults(
  preset: ArtworkCreatePreset | undefined,
): ArtworkFormInitial {
  const base = emptyCreate();
  if (!preset) return base;
  return {
    ...base,
    ...(preset.section ? { section: preset.section } : {}),
    ...(preset.isCollectionComposite !== undefined
      ? { isCollectionComposite: preset.isCollectionComposite }
      : {}),
    ...(preset.collectionSeriesKey
      ? { collectionSeriesKey: preset.collectionSeriesKey }
      : {}),
  };
}

type Props =
  | { mode: "create"; createPreset?: ArtworkCreatePreset }
  | { mode: "edit"; initial: ArtworkFormInitial };

export function ArtworkForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [composites, setComposites] = useState<AdminArtworkSummary[]>([]);
  const [compositionPickSlug, setCompositionPickSlug] = useState("");
  const [manualCompositionUrl, setManualCompositionUrl] = useState("");
  const slugEditedByUserRef = useRef(false);
  const autoSeriesKeyDoneRef = useRef(false);

  const {
    register,
    watch,
    setValue,
    getValues,
    handleSubmit,
  } = useForm<ArtworkFormInitial>({
    defaultValues:
      props.mode === "edit"
        ? props.initial
        : mergeCreateDefaults(
            props.mode === "create" && "createPreset" in props
              ? props.createPreset
              : undefined,
          ),
  });

  const wantAutoSeriesKey =
    props.mode === "create" &&
    "createPreset" in props &&
    Boolean(props.createPreset?.autoCollectionSeriesKey);

  useEffect(() => {
    if (!wantAutoSeriesKey) return;
    if (autoSeriesKeyDoneRef.current) return;
    if (getValues("collectionSeriesKey").trim()) return;
    autoSeriesKeyDoneRef.current = true;
    const key = `series-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    setValue("collectionSeriesKey", key, { shouldDirty: false });
  }, [getValues, setValue, wantAutoSeriesKey]);

  const values = watch();
  const isCollection = values.section === "collection";
  const showHotspots = isCollection && !values.isCollectionComposite;
  const showComposite = isCollection;

  const createPreset =
    props.mode === "create" && "createPreset" in props
      ? props.createPreset
      : undefined;
  const isFragmentCreate = isFragmentCreatePreset(createPreset);
  const fragmentSeriesKey =
    isFragmentCreate && createPreset?.collectionSeriesKey
      ? createPreset.collectionSeriesKey.trim()
      : "";

  /** Slug только из названия, без ручного поля */
  const hideCreateSlugUi =
    props.mode === "create" &&
    (isFragmentCreate || (wantAutoSeriesKey && isCollection));

  /** Секция фиксирована: фрагмент или новая коллекция с авто-ключом */
  const lockSectionField =
    isFragmentCreate ||
    (props.mode === "create" && wantAutoSeriesKey && isCollection);

  const matchedParentComposite = useMemo(() => {
    if (!fragmentSeriesKey) return null;
    return (
      composites.find(
        (r) =>
          r.section === "collection" &&
          r.isCollectionComposite &&
          (r.collectionSeriesKey?.trim() ?? "") === fragmentSeriesKey,
      ) ?? null
    );
  }, [composites, fragmentSeriesKey]);

  useEffect(() => {
    if (props.mode !== "create") return;
    if (!values.slug.trim()) slugEditedByUserRef.current = false;
    if (slugEditedByUserRef.current) return;
    const next = slugFromTitle(values.title);
    if (next === values.slug) return;
    setValue("slug", next, { shouldValidate: true, shouldDirty: false });
  }, [props.mode, setValue, values.title, values.slug]);

  useEffect(() => {
    if (!hideCreateSlugUi) return;
    const t = values.title.trim();
    setValue("alt", t, { shouldDirty: false });
    setValue("description", t, { shouldDirty: false });
  }, [hideCreateSlugUi, setValue, values.title]);

  useEffect(() => {
    if (!wantAutoSeriesKey || !isCollection) return;
    setValue("isCollectionComposite", true, { shouldDirty: false });
  }, [wantAutoSeriesKey, isCollection, setValue]);

  useEffect(() => {
    if (!showHotspots) {
      setCompositionPickSlug("");
      setManualCompositionUrl("");
      return;
    }
    let cancelled = false;
    fetchAdminArtworksList()
      .then((rows) => {
        if (cancelled) return;
        setComposites(
          rows.filter(
            (r) =>
              r.section === "collection" &&
              r.isCollectionComposite &&
              Boolean(r.images?.[0]?.url),
          ),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showHotspots]);

  const resolvedCompositionSlug =
    isFragmentCreate && matchedParentComposite
      ? matchedParentComposite.slug
      : compositionPickSlug;

  const pickedComposite = composites.find(
    (r) => r.slug === resolvedCompositionSlug,
  );
  const compositionGuideUrl =
    manualCompositionUrl.trim() || pickedComposite?.images[0]?.url || "";
  const compositionBoxAspect = pickedComposite
    ? boxAspectFromSummary(pickedComposite)
    : values.aspectRatio?.trim() && /^\d+\/\d+$/.test(values.aspectRatio.trim())
      ? values.aspectRatio.trim()
      : "2/3";

  const parseOptionalNumber = (v: string) => (v === "" ? null : Number(v));

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (props.mode === "create" && !values.imageUrl.trim()) {
      setError("Загрузите изображение или укажите URL ниже.");
      return;
    }
    setLoading(true);
    try {
      if (props.mode === "create") {
        const isColl = values.section === "collection";
        const payload = {
          slug: values.slug.trim(),
          title: values.title.trim(),
          alt: values.alt.trim(),
          description: values.description.trim(),
          medium: values.medium.trim(),
          widthCm: isColl ? undefined : values.widthCm ?? undefined,
          heightCm: isColl ? undefined : values.heightCm ?? undefined,
          section: values.section,
          status: values.status,
          aspectRatio: values.aspectRatio.trim() || undefined,
          isCollectionComposite: values.isCollectionComposite,
          hotspotX: showHotspots ? values.hotspotX ?? undefined : undefined,
          hotspotY: showHotspots ? values.hotspotY ?? undefined : undefined,
          hotspotW: showHotspots ? values.hotspotW ?? undefined : undefined,
          hotspotH: showHotspots ? values.hotspotH ?? undefined : undefined,
          collectionSeriesKey:
            isColl && values.collectionSeriesKey.trim()
              ? values.collectionSeriesKey.trim()
              : undefined,
          imageUrl: values.imageUrl.trim(),
        };
        await createAdminArtwork(payload);
        router.push("/admin");
        router.refresh();
        return;
      }

      const isColl = values.section === "collection";
      const patch: Record<string, unknown> = {
        title: values.title.trim(),
        alt: values.alt.trim(),
        description: values.description.trim(),
        medium: values.medium.trim(),
        widthCm: isColl ? null : values.widthCm,
        heightCm: isColl ? null : values.heightCm,
        section: values.section,
        status: values.status,
        aspectRatio: values.aspectRatio.trim() || null,
        isCollectionComposite: values.isCollectionComposite,
        hotspotX: showHotspots ? values.hotspotX : null,
        hotspotY: showHotspots ? values.hotspotY : null,
        hotspotW: showHotspots ? values.hotspotW : null,
        hotspotH: showHotspots ? values.hotspotH : null,
        collectionSeriesKey: isColl
          ? values.collectionSeriesKey.trim() || null
          : null,
      };
      if (values.imageUrl.trim()) {
        patch.imageUrl = values.imageUrl.trim();
      }

      await patchAdminArtwork(values.slug, patch);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  });

  const onDelete = async () => {
    const current = getValues();
    if (props.mode !== "edit") return;
    if (!confirm(`Удалить «${current.title}»?`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAdminArtwork(current.slug);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadBusy(true);
    setError(null);
    try {
      const url = await uploadAdminArtworkFile(file);
      if (url) {
        setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploadBusy(false);
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-xl border border-zinc-300/90 bg-white/95 px-3.5 py-2.5 text-sm text-zinc-900 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300/65 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700/60";
  const labelClass = "block text-sm font-medium text-zinc-800 dark:text-zinc-200";
  const slugRegister = register("slug", { required: true });

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-[1.5rem] border border-zinc-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(249,248,246,0.92)_100%)] p-6 text-zinc-900 shadow-[0_26px_56px_-36px_rgba(15,23,42,0.45)] ring-1 ring-white/60 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/5"
    >
      <header className="space-y-2 border-b border-zinc-200/80 pb-4 dark:border-zinc-700/70">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Админка галереи
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {props.mode === "create" && isFragmentCreate
            ? "Новый фрагмент коллекции"
            : props.mode === "create" && wantAutoSeriesKey && isCollection
              ? "Новая коллекция"
              : props.mode === "create"
                ? "Новая работа"
                : "Редактирование работы"}
        </h1>
      </header>

      {props.mode === "create" && isFragmentCreate ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100">
          Ключ серии уже задан (
          <span className="font-mono font-medium">{fragmentSeriesKey}</span>
          ) — совпадает с общей композицией. Ниже разметьте область этого кадра на
          превью композиции.
        </p>
      ) : null}

      {props.mode === "edit" ? (
        <p className="rounded-xl border border-zinc-200/85 bg-white/80 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-300">
          Slug:{" "}
          <span className="font-mono text-zinc-900 dark:text-zinc-100">{values.slug}</span>
        </p>
      ) : null}

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

      {props.mode === "create" && hideCreateSlugUi ? (
        <input type="hidden" {...register("slug", { required: true })} />
      ) : props.mode === "create" ? (
        <label className={labelClass}>
          <span>Slug (URL-id)</span>
          <p className="mt-0.5 text-xs font-normal leading-snug text-zinc-500 dark:text-zinc-400">
            Генерируется из названия (транслит); при необходимости отредактируйте вручную.
          </p>
          <input
            required
            className={`${fieldClass} font-mono`}
            placeholder="dar-nochi"
            {...slugRegister}
            onChange={(e) => {
              slugEditedByUserRef.current = true;
              slugRegister.onChange(e);
            }}
          />
        </label>
      ) : null}

      {hideCreateSlugUi ? (
        <>
          <input type="hidden" {...register("alt", { required: true })} />
          <input type="hidden" {...register("description", { required: true })} />
        </>
      ) : (
        <>
          <label className={labelClass}>
            <span>Alt</span>
            <input
              required
              className={fieldClass}
              {...register("alt", { required: true })}
            />
          </label>

          <label className={labelClass}>
            <span>Описание (текст на сайте)</span>
            <textarea
              required
              rows={5}
              className={fieldClass}
              {...register("description", { required: true })}
            />
          </label>
        </>
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

      <section className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
          Параметры полотна
        </h2>

      {!isCollection ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            <span>Ширина, см</span>
            <input
              type="number"
              min={1}
              className={fieldClass}
              {...register("widthCm", {
                setValueAs: parseOptionalNumber,
              })}
            />
          </label>
          <label className={labelClass}>
            <span>Высота, см</span>
            <input
              type="number"
              min={1}
              className={fieldClass}
              {...register("heightCm", {
                setValueAs: parseOptionalNumber,
              })}
            />
          </label>
        </div>
      ) : null}

      {lockSectionField ? <input type="hidden" {...register("section")} /> : null}

      <div
        className={`grid grid-cols-1 gap-3 ${lockSectionField ? "" : "sm:grid-cols-2"}`}
      >
        {!lockSectionField ? (
          <label className={labelClass}>
            <span>Секция</span>
            <select
              className={fieldClass}
              {...register("section", {
                onChange: (e) => {
                  const section = e.target.value as ArtworkSection;
                  if (section === "works") {
                    setValue("isCollectionComposite", false);
                    setValue("collectionSeriesKey", "");
                  }
                  if (section === "collection") {
                    setValue("widthCm", null, { shouldDirty: true });
                    setValue("heightCm", null, { shouldDirty: true });
                  }
                },
              })}
            >
              <option value="works">Работы (слайдер 3D)</option>
              <option value="collection">Коллекция</option>
            </select>
          </label>
        ) : null}
        <label className={labelClass}>
          <span>Статус</span>
          <select
            className={fieldClass}
            {...register("status")}
          >
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
            : " (опционально, иначе из см)"}
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
          <input
            type="checkbox"
            {...register("isCollectionComposite")}
          />
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

      {showHotspots ? (
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
                  Сначала укажите то же изображение, что загружено у записи с опцией «общая
                  композиция» (выберите её в списке или вставьте URL). Затем обведите на
                  превью область этого фрагмента — координаты подставятся в поля ниже. На
                  сайте используются те же пропорции блока и{" "}
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

          {isFragmentCreate &&
          !matchedParentComposite &&
          composites.length > 0 ? (
            <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              Запись с общей композицией и тем же ключом серии в базе не найдена — выберите
              композицию в списке или вставьте URL изображения выше.
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
                onChange={(v) => {
                  setValue("hotspotX", v.x, { shouldDirty: true });
                  setValue("hotspotY", v.y, { shouldDirty: true });
                  setValue("hotspotW", v.w, { shouldDirty: true });
                  setValue("hotspotH", v.h, { shouldDirty: true });
                }}
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
              <label key={key} className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
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
            onClick={() => {
              setValue("hotspotX", null, { shouldDirty: true });
              setValue("hotspotY", null, { shouldDirty: true });
              setValue("hotspotW", null, { shouldDirty: true });
              setValue("hotspotH", null, { shouldDirty: true });
            }}
          >
            Сбросить область
          </button>
        </div>
      ) : null}

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

        {values.imageUrl.trim() ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100/60 dark:border-zinc-700 dark:bg-zinc-900/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.imageUrl.trim()}
              alt="Предпросмотр"
              className="mx-auto max-h-64 w-auto max-w-full object-contain"
            />
          </div>
        ) : null}

        <label className={labelClass}>
          <span>
            Или URL картинки (
            {props.mode === "create"
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

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-700/70">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.6)] transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Сохранение…" : "Сохранить"}
        </button>
        {props.mode === "edit" ? (
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-xl border border-rose-300 bg-white/85 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            Удалить
          </button>
        ) : null}
      </div>
    </form>
  );
}
