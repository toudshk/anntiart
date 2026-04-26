import Image from "next/image";

import type { WorkMeta } from "view/constants/works-meta";
import { shouldUseUnoptimizedNextImage } from "view/lib/artwork-image-url";

import { PicturesGallery } from "./PicturesGallery";
import type { PicturesGalleryProps } from "./PicturesGallery";

function heightFromAspect(baseW: number, aspectRatio?: string): number {
  if (!aspectRatio?.includes("/")) return Math.round((baseW * 4) / 3);
  const [a, b] = aspectRatio.split("/").map(Number);
  if (!a || !b) return Math.round((baseW * 4) / 3);
  return Math.round((baseW * b) / a);
}

/**
 * Серверная обёртка: в HTML ответа попадают реальные изображения работ из БД и подписи
 * для SEO/скринридеров; интерактив остаётся в клиентском {@link PicturesGallery}.
 */
export function PicturesGallerySsr(props: PicturesGalleryProps) {
  const works = props.works ?? [];
  const workMeta: Record<string, WorkMeta> = props.workMeta ?? {};

  return (
    <>
      {works.length > 0 ? (
        <section
          className="sr-only"
          aria-label="Каталог работ: изображения и описания для индексации"
        >
          <h2>Галерея работ</h2>
          {works.map((w, idx) => {
            const meta = workMeta[w.id];
            const title = meta?.title ?? w.alt;
            const baseW = 640;
            const h = heightFromAspect(baseW, w.aspectRatio);
            return (
              <figure key={w.id}>
                <Image
                  src={w.src}
                  alt={w.alt}
                  width={baseW}
                  height={h}
                  sizes="640px"
                  unoptimized={shouldUseUnoptimizedNextImage(w.src)}
                  priority={idx === 0}
                  {...(idx > 0 ? { loading: "lazy" as const } : {})}
                />
                <figcaption>
                  <strong>{title}</strong>
                  {meta?.medium ? ` — ${meta.medium}.` : "."}
                  {meta?.text ? ` ${meta.text}` : ""}
                </figcaption>
              </figure>
            );
          })}
        </section>
      ) : null}
      <PicturesGallery {...props} />
    </>
  );
}
