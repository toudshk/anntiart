"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  /** соотношение сторон холста */
  aspectRatio?: `${number}/${number}`;
  className?: string;
  priority?: boolean;
};

/**
 * Заготовка: картина как на холсте с деревянным подрамником (вид спереди + намёк на толщину снизу).
 */
export function FramedPicture({
  src,
  alt,
  aspectRatio = "4/3",
  className = "",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={`mx-auto w-full max-w-md ${className}`}
      style={{ perspective: "1200px" }}
    >
      <div className="relative">
        {/* внешняя тень «от стены» */}
        <div
          className="rounded-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55),0_4px_14px_-4px_rgba(0,0,0,0.35)]"
          style={{ transform: "translateZ(0)" }}
        >
          {/* багет / передняя кромка рамы */}
          <div className="rounded-sm bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 p-[9px] ring-1 ring-black/25">
            {/* внутренний скос рамы */}
            <div className="rounded-sm bg-gradient-to-br from-amber-800/95 to-amber-950 p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              {/* борт холста: светлая кромка, имитация загиба полотна */}
              <div className="rounded-sm bg-[#ebe4d8] p-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                <div
                  className="relative w-full overflow-hidden bg-[#d4cfc4] shadow-[inset_0_3px_14px_rgba(0,0,0,0.18)]"
                  style={{ aspectRatio }}
                >
                  {!failed ? (
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      priority={priority}
                      sizes="(max-width: 768px) 100vw, 28rem"
                      className="object-cover"
                      onError={() => setFailed(true)}
                    />
                  ) : null}
                  {failed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-300 to-zinc-400 p-4 text-center text-zinc-700">
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Заготовка
                      </span>
                      <span className="text-xs leading-snug">
                        Добавьте файл в{" "}
                        <code className="rounded bg-black/10 px-1 py-0.5">
                          public/pictures
                        </code>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* нижняя грань подрамника (толщина) */}
        <div
          aria-hidden
          className="pointer-events-none mx-auto mt-0 h-3 w-[88%] rounded-b-md bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          style={{
            transform: "rotateX(42deg)",
            transformOrigin: "top center",
          }}
        />
      </div>
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}
