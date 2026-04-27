"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Фото для hero (галерея). */
const HERO_GALLERY_IMAGE = "/pictures/landing/anna.png";

/** Доп. скролл после первого экрана (липкий hero). GSAP ScrollTrigger надёжнее с vh, не dvh. */
const HERO_EXTRA_SCROLL_VH = 42;
/** Доля дистанции скролла hero без размытия (0–1); дальше плавно blur. */
const HERO_BLUR_SCROLL_DELAY = 0.32;

function ScrollDownHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-10 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-0 text-zinc-500 dark:text-zinc-400"
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
      const section = rootRef.current;
      if (section?.querySelector("[data-gsap='hero-photo']")) {
        gsap.from("[data-gsap='hero-photo']", {
          opacity: 0,
          x: 28,
          duration: 0.85,
          delay: 0.04,
          ease: "power2.out",
        });
      }
      gsap.from("[data-gsap='hero-title']", {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: "power3.out",
        delay: 0,
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
      id="landing-hero"
      ref={rootRef}
      className="relative z-10 bg-pastel-hero dark:bg-zinc-950"
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
        className="sticky top-0 flex h-svh w-full flex-col overflow-hidden will-change-[filter,opacity,transform]"
      >
        <div className="relative isolate z-10 min-h-0 w-full flex-1 overflow-hidden">
          {/* Фото справа, под слоем текста (z-0) — вне scale, остаётся на месте при скролле */}
          <div
            data-gsap="hero-photo"
            className="absolute inset-y-0 right-0 z-0 w-[min(88%,24rem)] sm:w-[min(85%,30rem)] md:w-[min(70%,36rem)] lg:w-[min(46vw,38rem)] xl:w-[min(60vw,40rem)]"
          >
            <div className="absolute inset-0 translate-x-3 sm:translate-x-4 md:translate-x-5 lg:translate-x-6 xl:translate-x-8">
              <div className="absolute inset-0">
                <Image
                  src={HERO_GALLERY_IMAGE}
                  alt="Анна Тихоненко в галерее среди работ"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 60vw, 46vw"
                  className="object-cover object-[64%_center] brightness-[1.05] contrast-[1.08] saturate-[0.86] hue-rotate-[-8deg] lg:object-[62%_center] dark:brightness-[0.9] dark:contrast-[1.06] dark:saturate-[0.78] dark:hue-rotate-[-4deg]"
                />
                {/* Плавный переход фото → фон hero (цвет pastel-hero / zinc-950) */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[min(100%,18rem)] bg-[linear-gradient(90deg,#e0ded9_0%,rgba(224,222,217,0.88)_14%,rgba(224,222,217,0.45)_38%,rgba(224,222,217,0.12)_58%,transparent_78%)] sm:w-[min(100%,22rem)] md:w-[min(100%,26rem)] lg:w-[min(100%,30rem)] dark:bg-[linear-gradient(90deg,rgb(9_9_11)_0%,rgba(9,9,11,0.82)_16%,rgba(9,9,11,0.42)_40%,rgba(9,9,11,0.1)_60%,transparent_80%)]"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* Текст по центру; scale только здесь — фото не участвует */}
          <div
            data-gsap="hero-title-scale"
            className="pointer-events-none absolute inset-0 z-20 flex origin-center flex-col items-center justify-center px-4 pt-16 text-center will-change-transform sm:px-10 sm:pt-20 md:pt-24 lg:pt-28"
          >
            <div className="pointer-events-auto flex max-w-[100vw] flex-col items-center">
              <h1
                id="landing-hero-heading"
                data-gsap="hero-title"
                className="font-literature-decor whitespace-nowrap text-4xl font-thin tracking-tight text-zinc-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-zinc-100"
              >
                Галерея Анны Тихоненко
              </h1>
              <p
                data-gsap="hero-text"
                className="mx-auto mt-4 max-w-lg text-base text-zinc-800 sm:mt-5 sm:text-lg dark:text-zinc-200"
              >
                <a
                  href="https://t.me/anntiart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-800 underline decoration-zinc-500/60 underline-offset-2 transition hover:text-zinc-950 hover:decoration-zinc-700 dark:text-zinc-200 dark:decoration-zinc-400/70 dark:hover:text-white dark:hover:decoration-zinc-300"
                >
                  @anntiart
                </a>
              </p>
            </div>
          </div>
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
