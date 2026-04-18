"use client";

import { useCallback, useEffect, useState } from "react";
import ReactCrop, {
  type Crop,
  type PercentCrop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function percentCropFromValues(
  x: number | null,
  y: number | null,
  w: number | null,
  h: number | null,
): PercentCrop | undefined {
  if (
    x == null ||
    y == null ||
    w == null ||
    h == null ||
    Number.isNaN(x + y + w + h)
  ) {
    return undefined;
  }
  return { unit: "%", x, y, width: w, height: h };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export type CollectionHotspotEditorProps = {
  compositionSrc: string;
  /** Как на лендинге: контейнер с тем же aspect-ratio, что у общей композиции */
  boxAspect: string;
  x: number | null;
  y: number | null;
  w: number | null;
  h: number | null;
  onChange: (next: { x: number; y: number; w: number; h: number }) => void;
};

export function CollectionHotspotEditor({
  compositionSrc,
  boxAspect,
  x,
  y,
  w,
  h,
  onChange,
}: CollectionHotspotEditorProps) {
  const [crop, setCrop] = useState<Crop | undefined>(() =>
    percentCropFromValues(x, y, w, h),
  );

  useEffect(() => {
    setCrop(percentCropFromValues(x, y, w, h));
  }, [x, y, w, h]);

  const applyPercent = useCallback(
    (pc: PercentCrop) => {
      onChange({
        x: round1(pc.x),
        y: round1(pc.y),
        w: round1(pc.width),
        h: round1(pc.height),
      });
    },
    [onChange],
  );

  const handleChange = useCallback(
    (_pixel: PixelCrop, percent: PercentCrop) => {
      setCrop(percent);
    },
    [],
  );

  const handleComplete = useCallback(
    (_pixel: PixelCrop, percent: PercentCrop) => {
      applyPercent(percent);
    },
    [applyPercent],
  );

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900">
      <div
        className="relative w-full max-h-[min(72vh,560px)] min-h-[200px]"
        style={{ aspectRatio: boxAspect }}
      >
        <ReactCrop
          crop={crop}
          onChange={handleChange}
          onComplete={handleComplete}
          ruleOfThirds
          className="admin-collection-crop absolute inset-0 !max-w-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compositionSrc}
            alt="Подложка композиции для разметки hotspot"
            className="block h-full w-full object-cover"
          />
        </ReactCrop>
      </div>
    </div>
  );
}
