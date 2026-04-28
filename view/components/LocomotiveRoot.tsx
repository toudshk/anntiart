"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: React.ReactNode;
};

type ScrollLockApi = {
  lockScroll: () => void;
  unlockScroll: () => void;
};

const ScrollLockContext = createContext<ScrollLockApi | null>(null);

/** Блокировка нативного скролла + остановка Locomotive/Lenis (на десктопе). */
export function useScrollLock(): ScrollLockApi {
  const ctx = useContext(ScrollLockContext);
  if (!ctx) {
    throw new Error("useScrollLock должен вызываться внутри LocomotiveRoot");
  }
  return ctx;
}

/**
 * Locomotive Scroll (Lenis) + синхронизация с GSAP ScrollTrigger.
 */
export function LocomotiveRoot({ children }: Props) {
  const locoRef = useRef<LocomotiveScroll | null>(null);
  const lockCountRef = useRef(0);
  const storedRef = useRef<{
    htmlOverflow: string;
    bodyOverflow: string;
    htmlOverscroll: string;
  } | null>(null);

  const lockScroll = useCallback(() => {
    lockCountRef.current += 1;
    if (lockCountRef.current !== 1) return;
    storedRef.current = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      htmlOverscroll: document.documentElement.style.overscrollBehavior,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    locoRef.current?.stop();
  }, []);

  const unlockScroll = useCallback(() => {
    if (lockCountRef.current <= 0) return;
    lockCountRef.current -= 1;
    if (lockCountRef.current !== 0) return;
    const prev = storedRef.current;
    if (prev) {
      document.documentElement.style.overflow = prev.htmlOverflow;
      document.body.style.overflow = prev.bodyOverflow;
      document.documentElement.style.overscrollBehavior = prev.htmlOverscroll;
    }
    storedRef.current = null;
    locoRef.current?.start();
  }, []);

  const scrollLockValue = useMemo(
    () => ({ lockScroll, unlockScroll }),
    [lockScroll, unlockScroll],
  );

  useLayoutEffect(() => {
    const isIOS =
      /iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

    // На iOS/тач-устройствах оставляем нативный скролл:
    // меньше рисков зависаний/конфликтов с WebKit.
    if (isIOS || isTouchDevice) return;

    // На iPhone/iPad Safari меняет viewport при показе/скрытии URL-бара.
    // Это не должно инициировать auto-refresh у ScrollTrigger, иначе скролл рвётся.
    ScrollTrigger.config({ ignoreMobileResize: true });

    let loco: LocomotiveScroll | null = null;
    try {
      loco = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.088,
          smoothWheel: true,
          wheelMultiplier: 0.9,
        },
      });
    } catch {
      // Если библиотека не поднялась (редкие браузерные кейсы), остаёмся на native scroll.
      return;
    }
    const lenis = loco.lenisInstance;
    if (!lenis) {
      loco.destroy();
      return;
    }

    locoRef.current = loco;

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
      locoRef.current = null;
      loco?.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
    };
  }, []);

  return (
    <ScrollLockContext.Provider value={scrollLockValue}>
      {children}
    </ScrollLockContext.Provider>
  );
}
