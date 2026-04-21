"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: React.ReactNode;
};

/**
 * Locomotive Scroll (Lenis) + синхронизация с GSAP ScrollTrigger.
 */
export function LocomotiveRoot({ children }: Props) {
  useLayoutEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iP(ad|hone|od)/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isWebKit = /WebKit/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);

    // iOS Safari меняет viewport при появлении/скрытии верхней и нижней панелей.
    // В сочетании со smooth-scroll proxy это вызывает заметное дёрганье при скролле.
    if (isIOS && isWebKit) {
      const rafId = requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const loco = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.088,
        smoothWheel: true,
        wheelMultiplier: 0.9,
      },
    });
    const lenis = loco.lenisInstance;
    if (!lenis) return;

    const pinType: "fixed" | "transform" = document.documentElement.style
      .transform
      ? "transform"
      : "fixed";

    const scrollProxy = {
      scrollTop(value?: number) {
        if (arguments.length && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType,
    };

    ScrollTrigger.scrollerProxy(document.documentElement, scrollProxy);

    const unsubLenisScroll = lenis.on("scroll", ScrollTrigger.update);

    const onStRefresh = () => {
      loco.resize();
    };
    ScrollTrigger.addEventListener("refresh", onStRefresh);

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refresh", onStRefresh);
      unsubLenisScroll();
      loco.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
    };
  }, []);

  return <>{children}</>;
}
