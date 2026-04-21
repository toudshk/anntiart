"use client";

import { ArtworkBasicsSection } from "./ArtworkBasicsSection";
import { ArtworkFormActions } from "./ArtworkFormActions";
import { ArtworkFormHeader } from "./ArtworkFormHeader";
import { ArtworkHotspotSection } from "./ArtworkHotspotSection";
import { ArtworkImagesSection } from "./ArtworkImagesSection";
import { ArtworkSettingsSection } from "./ArtworkSettingsSection";
import { parseOptionalNumber } from "./utils";
import { useArtworkFormController } from "./useArtworkFormController";
import type { ArtworkCreatePreset, ArtworkFormInitial } from "./types";

export type { ArtworkCreatePreset, ArtworkFormInitial } from "./types";

type Props =
  | { mode: "create"; createPreset?: ArtworkCreatePreset }
  | { mode: "edit"; initial: ArtworkFormInitial };

export function ArtworkForm(props: Props) {
  const controller = useArtworkFormController(props);

  return (
    <form
      onSubmit={controller.onSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-[1.5rem] border border-zinc-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(249,248,246,0.92)_100%)] p-6 text-zinc-900 shadow-[0_26px_56px_-36px_rgba(15,23,42,0.45)] ring-1 ring-white/60 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/5"
    >
      <ArtworkFormHeader
        mode={props.mode}
        isFragmentCreate={controller.isFragmentCreate}
        wantAutoSeriesKey={controller.wantAutoSeriesKey}
        isCollection={controller.isCollection}
        fragmentSeriesKey={controller.fragmentSeriesKey}
        slug={controller.values.slug}
      />

      <ArtworkBasicsSection
        mode={props.mode}
        hideCreateDescriptionUi={controller.hideCreateDescriptionUi}
        register={controller.register}
      />

      <ArtworkSettingsSection
        mode={props.mode}
        isCollection={controller.isCollection}
        isFragmentCreate={controller.isFragmentCreate}
        wantAutoSeriesKey={controller.wantAutoSeriesKey}
        lockSectionField={controller.lockSectionField}
        showComposite={controller.showComposite}
        register={controller.register}
        onSectionChange={controller.onSectionChange}
      />

      <ArtworkHotspotSection
        showHotspots={controller.showHotspots}
        isFragmentCreate={controller.isFragmentCreate}
        matchedParentComposite={controller.matchedParentComposite}
        composites={controller.composites}
        compositionPickSlug={controller.compositionPickSlug}
        setCompositionPickSlug={controller.setCompositionPickSlug}
        manualCompositionUrl={controller.manualCompositionUrl}
        setManualCompositionUrl={controller.setManualCompositionUrl}
        compositionGuideUrl={controller.compositionGuideUrl}
        compositionBoxAspect={controller.compositionBoxAspect}
        values={controller.values}
        register={controller.register}
        onHotspotEditorChange={controller.onHotspotEditorChange}
        onResetHotspot={controller.onResetHotspot}
        parseOptionalNumber={parseOptionalNumber}
      />

      <ArtworkImagesSection
        mode={props.mode}
        uploadBusy={controller.uploadBusy}
        loading={controller.loading}
        previewUrls={controller.previewUrls}
        register={controller.register}
        onPickImage={controller.onPickImage}
      />

      <ArtworkFormActions
        mode={props.mode}
        error={controller.error}
        loading={controller.loading}
        onDelete={controller.onDelete}
      />
    </form>
  );
}
