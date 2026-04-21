"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Доп. скролл после первого экрана (липкий hero). GSAP ScrollTrigger надёжнее с vh, не dvh. */
const HERO_EXTRA_SCROLL_VH = 42;
/** Доля этой дистанции без размытия (0–1); дальше плавно до blur. Привязка к hero, не к галерее — стабильно с Lenis. */
const HERO_BLUR_SCROLL_DELAY = 0.32;

function ScrollDownHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0 text-zinc-500 dark:text-zinc-400"
      data-gsap="scroll-hint"
    >
      <span className="sr-only">Прокрутите страницу вниз, чтобы увидеть галерею</span>
      <svg
        width="40"
        height="56"
        viewBox="0 0 40 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-90"
        aria-hidden
      >
        <path
          d="M8 18 L20 30 L32 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 28 L20 40 L32 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);
  const catRef = useRef<HTMLElement>(null);
  const lastWidthRef = useRef<number>(0);
  const [showCat, setShowCat] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-gsap='hero-title']", {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: "power3.out",
      });
      gsap.from("[data-gsap='hero-text']", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        delay: 0.12,
        ease: "power2.out",
      });
      gsap.from("[data-gsap='scroll-hint']", {
        opacity: 0,
        duration: 0.5,
        delay: 0.85,
        ease: "power2.out",
      });
      gsap.from("[data-gsap='hero-paws']", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.45,
        ease: "power2.out",
      });
      gsap.to("[data-gsap='scroll-hint']", {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.15,
        ease: "sine.inOut",
        delay: 1.1,
      });

      const section = rootRef.current;
      const scaleRoot = section?.querySelector<HTMLElement>(
        "[data-gsap='hero-title-scale']",
      );
      const sticky = section?.querySelector<HTMLElement>("[data-hero-sticky]");

      if (section && scaleRoot && sticky) {
        gsap.set(sticky, { filter: "none", opacity: 1 });

        const blurDuration = 1 - HERO_BLUR_SCROLL_DELAY;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${HERO_EXTRA_SCROLL_VH}vh`,
            scrub: 0.65,
            scroller: document.documentElement,
            invalidateOnRefresh: true,
            immediateRender: false,
          },
        });

        tl.to(scaleRoot, { scale: 0.9, duration: 1, ease: "none" }, 0);
        tl.fromTo(
          sticky,
          { filter: "blur(0px)", opacity: 1 },
          {
            filter: "blur(10px)",
            opacity: 0.78,
            duration: blurDuration,
            ease: "none",
          },
          HERO_BLUR_SCROLL_DELAY,
        );
      }
    }, rootRef);

    lastWidthRef.current = window.innerWidth;

    const onResize = () => {
      if (window.innerWidth === lastWidthRef.current) return;
      lastWidthRef.current = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useLayoutEffect(() => {
    if (!catRef.current) return;
    gsap.to(catRef.current, {
      opacity: showCat ? 1 : 0,
      y: showCat ? 0 : 18,
      scale: showCat ? 1 : 0.96,
      duration: 0.35,
      ease: "power2.out",
      pointerEvents: showCat ? "auto" : "none",
    });
  }, [showCat]);

  return (
    <section
      ref={rootRef}
      className="relative z-10 bg-pastel-hero"
      style={{
        height: `calc(100svh + ${HERO_EXTRA_SCROLL_VH}vh)`,
      }}
      aria-labelledby="landing-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -right-[18%] top-[18%] h-[min(52vw,30rem)] w-[min(52vw,30rem)] rounded-full bg-pastel-gray-200/45 blur-3xl dark:bg-zinc-600/18" />
        <div className="absolute -left-[12%] bottom-[12%] h-[min(48vw,24rem)] w-[min(48vw,24rem)] rounded-full bg-pastel-beige-100/40 blur-3xl dark:bg-zinc-700/12" />
        <div className="absolute left-1/2 top-1/3 h-[min(36vw,14rem)] w-[min(36vw,14rem)] -translate-x-1/2 rounded-full bg-white/25 blur-2xl dark:bg-zinc-500/8" />
      </div>
      <div
        data-hero-sticky
        className="sticky top-0 flex h-svh flex-col items-center justify-center gap-6 overflow-x-hidden px-6 pt-48 text-center will-change-[filter,opacity]"
      >
        <div
          data-gsap="hero-title-scale"
          className="relative z-10 w-full  origin-center will-change-transform"
        >
          <h1
            id="landing-hero-heading"
            data-gsap="hero-title"
            className="font-literature-decor relative z-10 text-4xl font-thin tracking-tight text-zinc-900 sm:text-6xl lg:text-8xl dark:text-zinc-100"
          >
            Галерея Анны Тихоненко
          </h1>
          <p
            data-gsap="hero-text"
            className="relative z-10 mx-auto mt-6 max-w-lg text-center text-lg text-zinc-600 dark:text-zinc-400"
          >
            <a
              href="https://t.me/anntiart"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline decoration-zinc-400/70 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-600 dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:text-zinc-100 dark:hover:decoration-zinc-400"
            >
              @anntiart
            </a>
          </p>
        </div>
        <div
          data-gsap="hero-paws"
          className="absolute bottom-5 right-3 z-[55] flex items-center gap-2 md:bottom-9 md:right-8"
        >
          <button
            type="button"
            onClick={() => setShowCat((v) => !v)}
            className="rounded-full border border-zinc-300/80 cursor-pointer text-sm font-medium text-zinc-700 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur-sm transition hover:scale-[1.03] hover:bg-white dark:border-zinc-600/75 dark:bg-zinc-900/75 dark:text-zinc-200 dark:hover:bg-zinc-800/90"
            aria-expanded={showCat}
            aria-controls="hero-cat-easter"
          >
            🐾
          </button>
        </div>
        <figure
          id="hero-cat-easter"
          ref={catRef}
          data-gsap="hero-cat"
          className="absolute bottom-16 right-3 z-[50] w-[min(10.5rem,36vw)] opacity-0 md:bottom-20 md:right-8 md:w-[min(12.5rem,26vw)]"
        >
          <div className="-rotate-[2.5deg]">
            <div className="overflow-hidden rounded-2xl border border-zinc-300/80 bg-white/70 shadow-[0_24px_52px_-18px_rgba(15,23,42,0.42),0_10px_20px_-12px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-zinc-900/[0.04] dark:border-zinc-600/75 dark:bg-zinc-900/55 dark:shadow-[0_24px_52px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-white/[0.06]">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src="/pictures/cat/cat-in-box.jpg"
                  alt="Кот Булочка в коробке"
                  fill
                  sizes="(max-width: 768px) 36vw, 200px"
                  className="object-cover object-[center_35%]"
                  priority={false}
                />
              </div>
            </div>
         
          </div>
        </figure>
        <ScrollDownHint />
      </div>
    </section>
  );
}
