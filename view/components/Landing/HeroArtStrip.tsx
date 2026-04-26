"use client";

import Image from "next/image";

import { shouldUseUnoptimizedNextImage } from "view/lib/artwork-image-url";

/** Внешний вид рамки + форма. */
export type HeroFrameStyle =
  | "oval-gold"
  | "oval-white"
  | "rect-gold"
  | "rect-gold-thin"
  | "silver"
  | "wood";

export type HeroArtStripLayout = {
  /** Tailwind width (clamp с vw для полосы на всю ширину). */
  widthClass: string;
  /** Доп. сдвиг по вертикали. */
  translateYClass?: string;
  frame: HeroFrameStyle;
};

export type HeroArtStripItem = {
  id: string;
  src: string;
  alt: string;
  /** Соотношение холста: `2/3`, `3/4` … */
  aspectRatio?: string;
  /** Размер рамки и стиль; без него — компактный дефолт. */
  layout?: HeroArtStripLayout;
};

function parseAspect(ar?: string): number {
  if (!ar?.includes("/")) return 3 / 4;
  const [a, b] = ar.split("/").map(Number);
  if (!a || !b) return 3 / 4;
  return a / b;
}

function stripT(i: number, n: number): number {
  if (n <= 1) return 0;
  const mid = (n - 1) / 2;
  return (i - mid) / Math.max(mid, 1);
}

const FRAME: Record<
  HeroFrameStyle,
  { shell: string; innerClip: string; isOval: boolean }
> = {
  "oval-gold": {
    shell:
      "rounded-[9999px] bg-gradient-to-br from-amber-700 via-amber-900 to-stone-900 p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-amber-950/35",
    innerClip: "rounded-[9999px]",
    isOval: true,
  },
  "oval-white": {
    shell:
      "rounded-[9999px] bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-400 p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-zinc-500/40 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-900 dark:ring-zinc-600/50",
    innerClip: "rounded-[9999px]",
    isOval: true,
  },
  "rect-gold": {
    shell:
      "rounded-md bg-gradient-to-br from-amber-800 via-amber-950 to-stone-950 p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-amber-950/40",
    innerClip: "rounded-sm",
    isOval: false,
  },
  "rect-gold-thin": {
    shell:
      "rounded-sm bg-gradient-to-br from-amber-900 to-amber-950 p-[2px] ring-1 ring-black/25",
    innerClip: "rounded-[2px]",
    isOval: false,
  },
  silver: {
    shell:
      "rounded-sm bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600 p-[3px] ring-1 ring-zinc-600/50 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-800",
    innerClip: "rounded-[2px]",
    isOval: false,
  },
  wood: {
    shell:
      "rounded-sm bg-gradient-to-br from-amber-900/90 via-stone-800 to-stone-950 p-[3px] ring-1 ring-stone-950/50",
    innerClip: "rounded-[2px]",
    isOval: false,
  },
};

export function HeroArtStrip({ items }: { items: HeroArtStripItem[] }) {
  if (items.length === 0) return null;

  const n = items.length;

  return (
    <div
      className="relative z-10 mb-4 w-screen max-w-none sm:mb-6"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        perspective: "min(140vw, 90rem)",
        transformStyle: "preserve-3d",
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-14 w-[min(94vw,80rem)] -translate-x-1/2 rounded-[50%] bg-zinc-900/[0.11] blur-3xl dark:bg-black/38"
        aria-hidden
      />
      <div className="relative z-10 w-full pb-3 pt-2 sm:pb-4">
        <div
          className="mx-auto flex w-full max-w-none flex-nowrap items-center justify-between gap-x-0.5 overflow-x-auto overflow-y-visible overscroll-x-contain px-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-1 sm:px-4 sm:overflow-x-visible md:gap-x-1.5 md:px-8 lg:gap-x-2 [&::-webkit-scrollbar]:hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => {
            const ratio = parseAspect(item.aspectRatio);
            const t = stripT(i, n);
            const maxY = 14;
            const rotateY = -t * maxY;
            const translateZ = -Math.abs(t) * 22;
            const layout = item.layout ?? {
              widthClass: "w-[clamp(2.75rem,8.5vw,5.25rem)]",
              frame: "rect-gold-thin" as const,
            };
            const F = FRAME[layout.frame];
            const yExtra = layout.translateYClass ?? "";

            return (
              <div
                key={item.id}
                data-gsap="hero-strip-item"
                className={`relative shrink-0 transition-transform duration-300 ease-out hover:z-40 ${yExtra}`}
                style={{
                  zIndex: 24 + i,
                  transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className={layout.widthClass}>
                  <div className={F.shell}>
                    <div
                      className={`${F.innerClip} bg-zinc-950/15 p-[2px] dark:bg-black/25`}
                    >
                      <div
                        className={`relative overflow-hidden bg-zinc-300/90 dark:bg-zinc-800/95 ${F.isOval ? "rounded-[9999px]" : "rounded-[1px]"}`}
                        style={{ aspectRatio: ratio }}
                      >
                        <Image
                          src={item.src}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 18vw, 14vw"
                          className="object-cover brightness-[0.88] contrast-[0.95] saturate-[0.86]"
                          unoptimized={shouldUseUnoptimizedNextImage(item.src)}
                          priority={i < 4}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
