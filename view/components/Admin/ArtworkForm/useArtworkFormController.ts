"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { resolveArtworkSlug } from "view/lib/slug-from-title";
import {
  apiErrorMessage,
  createAdminArtwork,
  deleteAdminArtwork,
  fetchAdminArtworksList,
  patchAdminArtwork,
  uploadAdminArtworkFile,
  type AdminArtworkSummary,
} from "view/requests";

import {
  boxAspectFromSummary,
  isFragmentCreatePreset,
  mergeCreateDefaults,
} from "./utils";
import type {
  ArtworkCreatePreset,
  ArtworkFormInitial,
  ArtworkSection,
} from "./types";

type Props =
  | { mode: "create"; createPreset?: ArtworkCreatePreset }
  | { mode: "edit"; initial: ArtworkFormInitial };

export function useArtworkFormController(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [composites, setComposites] = useState<AdminArtworkSummary[]>([]);
  const [compositionPickSlug, setCompositionPickSlug] = useState("");
  const [manualCompositionUrl, setManualCompositionUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(() =>
    props.mode === "edit" ? (props.initial.imageUrls ?? []) : [],
  );
  const autoSeriesKeyDoneRef = useRef(false);

  const { register, watch, setValue, getValues, handleSubmit } =
    useForm<ArtworkFormInitial>({
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

  const hideCreateDescriptionUi =
    props.mode === "create" &&
    (isFragmentCreate || (wantAutoSeriesKey && isCollection));

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
    const trimmed = values.title.trim();
    const next = trimmed ? resolveArtworkSlug(trimmed) : "";
    if (next === values.slug) return;
    setValue("slug", next, { shouldDirty: false });
  }, [props.mode, setValue, values.title, values.slug]);

  useEffect(() => {
    const t = values.title.trim();
    if (getValues("alt") === t) return;
    setValue("alt", t, { shouldDirty: false });
  }, [getValues, setValue, values.title]);

  useEffect(() => {
    if (!hideCreateDescriptionUi) return;
    const t = values.title.trim();
    if (getValues("description") === t) return;
    setValue("description", t, { shouldDirty: false });
  }, [hideCreateDescriptionUi, getValues, setValue, values.title]);

  useEffect(() => {
    if (!wantAutoSeriesKey || !isCollection) return;
    if (getValues("isCollectionComposite") === true) return;
    setValue("isCollectionComposite", true, { shouldDirty: false });
  }, [wantAutoSeriesKey, isCollection, getValues, setValue]);

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

  const pickedComposite = composites.find((r) => r.slug === resolvedCompositionSlug);
  const compositionGuideUrl =
    manualCompositionUrl.trim() || pickedComposite?.images[0]?.url || "";
  const compositionBoxAspect = pickedComposite
    ? boxAspectFromSummary(pickedComposite)
    : values.aspectRatio?.trim() && /^\d+\/\d+$/.test(values.aspectRatio.trim())
      ? values.aspectRatio.trim()
      : "2/3";

  const previewUrls = imageUrls;

  const onSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const section = e.target.value as ArtworkSection;
    if (section === "works") {
      setValue("isCollectionComposite", false);
      setValue("collectionSeriesKey", "");
    }
  };

  const onHotspotEditorChange = (v: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) => {
    setValue("hotspotX", v.x, { shouldDirty: true });
    setValue("hotspotY", v.y, { shouldDirty: true });
    setValue("hotspotW", v.w, { shouldDirty: true });
    setValue("hotspotH", v.h, { shouldDirty: true });
  };

  const onResetHotspot = () => {
    setValue("hotspotX", null, { shouldDirty: true });
    setValue("hotspotY", null, { shouldDirty: true });
    setValue("hotspotW", null, { shouldDirty: true });
    setValue("hotspotH", null, { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (submittedValues) => {
    setError(null);
    if (props.mode === "create" && imageUrls.length === 0) {
      setError("Загрузите изображение.");
      return;
    }

    setLoading(true);
    try {
      const title = submittedValues.title.trim();
      const alt = title;

      if (props.mode === "create") {
        const isColl = submittedValues.section === "collection";
        const payload = {
          slug: resolveArtworkSlug(title),
          title,
          alt,
          description: submittedValues.description.trim(),
          medium: submittedValues.medium.trim(),
          widthCm: undefined,
          heightCm: undefined,
          ...(submittedValues.priceRub != null
            ? { priceRub: submittedValues.priceRub }
            : {}),
          section: submittedValues.section,
          status: submittedValues.status,
          aspectRatio: submittedValues.aspectRatio.trim() || undefined,
          isCollectionComposite: submittedValues.isCollectionComposite,
          hotspotX: showHotspots ? submittedValues.hotspotX ?? undefined : undefined,
          hotspotY: showHotspots ? submittedValues.hotspotY ?? undefined : undefined,
          hotspotW: showHotspots ? submittedValues.hotspotW ?? undefined : undefined,
          hotspotH: showHotspots ? submittedValues.hotspotH ?? undefined : undefined,
          collectionSeriesKey:
            isColl && submittedValues.collectionSeriesKey.trim()
              ? submittedValues.collectionSeriesKey.trim()
              : undefined,
          ...(submittedValues.completedOn.trim()
            ? { completedOn: submittedValues.completedOn.trim() }
            : {}),
          imageUrl: imageUrls[0],
          imageUrls,
        };
        await createAdminArtwork(payload);
        router.push("/admin");
        router.refresh();
        return;
      }

      const isColl = submittedValues.section === "collection";
      const patch: Record<string, unknown> = {
        title,
        alt,
        description: submittedValues.description.trim(),
        medium: submittedValues.medium.trim(),
        priceRub: submittedValues.priceRub,
        section: submittedValues.section,
        status: submittedValues.status,
        aspectRatio: submittedValues.aspectRatio.trim() || null,
        isCollectionComposite: submittedValues.isCollectionComposite,
        hotspotX: showHotspots ? submittedValues.hotspotX : null,
        hotspotY: showHotspots ? submittedValues.hotspotY : null,
        hotspotW: showHotspots ? submittedValues.hotspotW : null,
        hotspotH: showHotspots ? submittedValues.hotspotH : null,
        collectionSeriesKey: isColl
          ? submittedValues.collectionSeriesKey.trim() || null
          : null,
        completedOn: submittedValues.completedOn.trim()
          ? submittedValues.completedOn.trim()
          : null,
      };
      if (imageUrls.length > 0) {
        patch.imageUrl = imageUrls[0];
        patch.imageUrls = imageUrls;
      }

      await patchAdminArtwork(submittedValues.slug, patch);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err));
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
      toast.error(apiErrorMessage(err));
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
        setImageUrls((prev) => [...prev, url]);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploadBusy(false);
    }
  };

  const onRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    error,
    loading,
    uploadBusy,
    values,
    register,
    isCollection,
    showHotspots,
    showComposite,
    isFragmentCreate,
    fragmentSeriesKey,
    hideCreateDescriptionUi,
    lockSectionField,
    wantAutoSeriesKey,
    matchedParentComposite,
    composites,
    compositionPickSlug,
    setCompositionPickSlug,
    manualCompositionUrl,
    setManualCompositionUrl,
    compositionGuideUrl,
    compositionBoxAspect,
    previewUrls,
    imageUrls,
    onSectionChange,
    onHotspotEditorChange,
    onResetHotspot,
    onSubmit,
    onDelete,
    onPickImage,
    onRemoveImage,
  };
}
