import Image from "next/image";

import { PICTURE_ITEMS } from "view/constants/pictures";
import { STATIC_WORKS_META } from "view/constants/works-meta";

import { PicturesGallery } from "./PicturesGallery";
import type { PicturesGalleryProps } from "./PicturesGallery";

const FALLBACK_WORKS = PICTURE_ITEMS.filter((item) => item.section === "works");

function heightFromAspect(baseW: number, aspectRatio?: string): number {
  if (!aspectRatio?.includes("/")) return Math.round((baseW * 4) / 3);
  const [a, b] = aspectRatio.split("/").map(Number);
  if (!a || !b) return Math.round((baseW * 4) / 3);
  return Math.round((baseW * b) / a);
}

/**
 * Обёртка без "use client": в HTML ответа попадают реальные img + подписи
 * для SEO и скринридеров; интерактив (3D, переключение работ) остаётся в {@link PicturesGallery}.
 */
export function PicturesGallerySsr(props: PicturesGalleryProps) {
  // const works = props.works ?? FALLBACK_WORKS;
  const works = props.works;
  const workMeta = props.workMeta ?? STATIC_WORKS_META;

  return (
    <>
      <section
        className="sr-only"
        aria-label="Каталог работ: изображения и описания для индексации"
      >
        <h2>Галерея работ</h2>
       
        {works && works.map((w, idx) => {
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
      <PicturesGallery {...props} />
    </>
  );
}
