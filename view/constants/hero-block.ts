import type { HeroArtStripItem } from "view/components/Landing/HeroArtStrip";

/**
 * Кадры hero: `public/pictures/hero-block/1.jpg` … `9.jpg`.
 * Разная ширина, рамки и смещение по Y — «стена» на всю ширину экрана.
 */
export const HERO_BLOCK_ART_STRIP: HeroArtStripItem[] = [
  {
    id: "hero-block-1",
    src: "/pictures/hero-block/1.jpg",
    alt: "Работа в галерее",
    aspectRatio: "3/2",
    layout: {
      widthClass: "w-[clamp(6.2rem,18.5vw,15.2rem)]",
      translateYClass: "translate-y-2",
      frame: "rect-gold",
    },
  },
  {
    id: "hero-block-2",
    src: "/pictures/hero-block/2.jpg",
    alt: "Работа в галерее",
    aspectRatio: "3/4",
    layout: {
      widthClass: "w-[clamp(4.9rem,15.8vw,12.4rem)]",
      translateYClass: "-translate-y-3 sm:-translate-y-4",
      frame: "oval-gold",
    },
  },
  {
    id: "hero-block-3",
    src: "/pictures/hero-block/3.jpg",
    alt: "Работа в галерее",
    aspectRatio: "1/1",
    layout: {
      widthClass: "w-[clamp(3.7rem,10vw,7.3rem)]",
      translateYClass: "translate-y-1",
      frame: "silver",
    },
  },
  {
    id: "hero-block-4",
    src: "/pictures/hero-block/4.jpg",
    alt: "Работа в галерее",
    aspectRatio: "1/1",
    layout: {
      widthClass: "w-[clamp(3.7rem,10vw,7.3rem)]",
      translateYClass: "translate-y-0.5",
      frame: "silver",
    },
  },
  {
    id: "hero-block-5",
    src: "/pictures/hero-block/5.jpg",
    alt: "Работа в галерее",
    aspectRatio: "1/1",
    layout: {
      widthClass: "w-[clamp(3.1rem,8.1vw,6rem)]",
      translateYClass: "translate-y-2",
      frame: "rect-gold-thin",
    },
  },
  {
    id: "hero-block-6",
    src: "/pictures/hero-block/6.jpg",
    alt: "Работа в галерее",
    aspectRatio: "2/3",
    layout: {
      widthClass: "w-[clamp(5.2rem,17.5vw,14.2rem)]",
      translateYClass: "-translate-y-1 sm:-translate-y-2",
      frame: "rect-gold",
    },
  },
  {
    id: "hero-block-7",
    src: "/pictures/hero-block/7.jpg",
    alt: "Работа в галерее",
    aspectRatio: "3/4",
    layout: {
      widthClass: "w-[clamp(4.3rem,12.8vw,10.2rem)]",
      translateYClass: "-translate-y-2 sm:-translate-y-3",
      frame: "oval-white",
    },
  },
  {
    id: "hero-block-8",
    src: "/pictures/hero-block/8.jpg",
    alt: "Работа в галерее",
    aspectRatio: "1/1",
    layout: {
      widthClass: "w-[clamp(3.1rem,7.7vw,5.7rem)]",
      translateYClass: "translate-y-1",
      frame: "rect-gold-thin",
    },
  },
  {
    id: "hero-block-9",
    src: "/pictures/hero-block/9.jpg",
    alt: "Работа в галерее",
    aspectRatio: "1/1",
    layout: {
      widthClass: "w-[clamp(4.3rem,13.4vw,10.5rem)]",
      translateYClass: "translate-y-0.5",
      frame: "wood",
    },
  },
];
