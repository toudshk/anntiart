"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

import type { PictureItem } from "view/constants/pictures";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  item: PictureItem | null;
  photoUrls?: string[];
};

function parseAspectRatio(ar: string | undefined): number {
  if (!ar || !ar.includes("/")) return 3 / 4;
  const [a, b] = ar.split("/").map(Number);
  if (!a || !b) return 3 / 4;
  return a / b;
}

function ChevronLeftSm({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightSm({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const photoNavBtnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/90 bg-gradient-to-b from-white to-zinc-50/95 text-zinc-700 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] transition hover:border-zinc-400 hover:text-zinc-900 hover:shadow-md active:scale-[0.96] dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900/95 dark:text-zinc-200 dark:hover:text-white";

function createFrameTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.colorSpace = THREE.SRGBColorSpace;
    return fallback;
  }

  // База дерева
  ctx.fillStyle = "#4a382c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Вертикальные волокна
  for (let x = 0; x < canvas.width; x += 2) {
    const alpha = 0.06 + Math.random() * 0.12;
    ctx.fillStyle = `rgba(25, 18, 12, ${alpha.toFixed(3)})`;
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  // Мягкие более светлые прожилки
  for (let i = 0; i < 8; i++) {
    const y = Math.random() * canvas.height;
    const h = 6 + Math.random() * 10;
    const a = 0.035 + Math.random() * 0.06;
    ctx.fillStyle = `rgba(180, 145, 108, ${a.toFixed(3)})`;
    ctx.fillRect(0, y, canvas.width, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Объёмный параллелепипед без скруглений: одна текстура по всему мешу.
 * Базовый поворот — стоящий «портрет», чуть развёрнут к камере.
 */
function buildFramedPainting(canvasW: number, canvasH: number): THREE.Group {
  const depth = 0.16;

  const pivot = new THREE.Group();
  /* Почти фронтально к камере; лёгкий наклон сохраняет объём */
  pivot.rotation.order = "YXZ";
  const baseRotY = -0.2;
  const baseRotX = 0.06;
  pivot.rotation.y = baseRotY;
  pivot.rotation.x = baseRotX;
  pivot.userData.baseRotY = baseRotY;
  pivot.userData.baseRotX = baseRotX;

  const frontMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.04,
    transparent: true,
    opacity: 1,
  });
  const canvasBaseMat = new THREE.MeshStandardMaterial({
    color: 0x101823,
    roughness: 0.82,
    metalness: 0,
  });
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x233244,
    roughness: 0.72,
    metalness: 0.08,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x151b23,
    roughness: 0.88,
    metalness: 0,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x544235,
    roughness: 0.66,
    metalness: 0.08,
  });
  const frameTex = createFrameTexture();
  frameMat.map = frameTex;
  frameMat.needsUpdate = true;

  const boxGeo = new THREE.BoxGeometry(canvasW, canvasH, depth);
  const body = new THREE.Mesh(boxGeo, [
    sideMat, // +X
    sideMat, // -X
    sideMat, // +Y
    sideMat, // -Y
    canvasBaseMat, // +Z (подложка под изображение)
    backMat, // -Z (задняя сторона)
  ]);
  pivot.add(body);

  const frameT = Math.max(Math.min(canvasW, canvasH) * 0.032, 0.032);
  const frameDepth = depth + 0.014;
  const frameOverlap = Math.max(frameT * 0.16, 0.01);
  const seamEps = 0.0015;
  const frameZ = 0;

  /* Полотно чуть уходит под рамку, чтобы не было светлых швов на стыке. */
  const paintBleed = Math.max(frameOverlap + 0.02, 0.05);
  const paintGeo = new THREE.PlaneGeometry(
    canvasW + paintBleed * 2,
    canvasH + paintBleed * 2,
  );
  const painting = new THREE.Mesh(paintGeo, frontMat);
  painting.position.z = depth / 2 + 0.004;
  pivot.add(painting);

  const frameTopGeo = new THREE.BoxGeometry(canvasW + frameT * 2, frameT, frameDepth);
  const frameTop = new THREE.Mesh(frameTopGeo, frameMat);
  frameTop.position.set(0, canvasH / 2 + frameT / 2 - frameOverlap, frameZ);
  pivot.add(frameTop);

  const frameBottomGeo = new THREE.BoxGeometry(
    canvasW + frameT * 2,
    frameT,
    frameDepth,
  );
  const frameBottom = new THREE.Mesh(frameBottomGeo, frameMat);
  frameBottom.position.set(0, -canvasH / 2 - frameT / 2 + frameOverlap, frameZ);
  pivot.add(frameBottom);

  const frameSideGeo = new THREE.BoxGeometry(
    frameT,
    canvasH - frameT * 0.12 + seamEps * 2,
    frameDepth,
  );
  const frameLeft = new THREE.Mesh(frameSideGeo, frameMat);
  frameLeft.position.set(-canvasW / 2 - frameT / 2 + frameOverlap, 0, frameZ);
  pivot.add(frameLeft);

  const frameRightGeo = frameSideGeo.clone();
  const frameRight = new THREE.Mesh(frameRightGeo, frameMat);
  frameRight.position.set(canvasW / 2 + frameT / 2 - frameOverlap, 0, frameZ);
  pivot.add(frameRight);

  pivot.userData.paintMat = frontMat;
  pivot.userData.extraMats = [canvasBaseMat, sideMat, backMat, frameMat];
  pivot.userData.extraTextures = [frameTex];
  pivot.userData.geometries = [
    boxGeo,
    paintGeo,
    frameTopGeo,
    frameBottomGeo,
    frameSideGeo,
    frameRightGeo,
  ];

  return pivot;
}

/**
 * Один WebGL-холст на весь блок «Картины»: все работы в одной сцене, без отдельного контекста на карточку.
 */
export function WorksGallery3D({ item, photoUrls = [] }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);
  const textureReqRef = useRef(0);
  const [view3d, setView3d] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const view3dRef = useRef(false);
  useEffect(() => {
    view3dRef.current = view3d;
  }, [view3d]);
  const runtimeRef = useRef<{
    texLoader: THREE.TextureLoader;
    camera: THREE.PerspectiveCamera;
    picture: THREE.Group;
    frontMat: THREE.MeshStandardMaterial;
    plateW: number;
    baseAspect: number;
    fitCamera: () => void;
    groundY: number;
    alignPictureToGround: (picture: THREE.Group) => void;
  } | null>(null);
  const prevTextureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !item) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 120);
    const texLoader = new THREE.TextureLoader();
    texLoader.setCrossOrigin("anonymous");

    const ambient = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff5e6, 0.58);
    /* Свет слева-сверху — тень падает вправо относительно картины */
    dir.position.set(-4.4, 3.85, 4.1);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 0.4;
    dir.shadow.camera.far = 22;
    dir.shadow.camera.left = -6;
    dir.shadow.camera.right = 6;
    dir.shadow.camera.top = 6;
    dir.shadow.camera.bottom = -6;
    dir.shadow.bias = -0.0004;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.18);
    fill.position.set(-3, 0.5, 2);
    scene.add(fill);
    const shadowFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 16),
      new THREE.ShadowMaterial({ opacity: 0.32, color: 0x0a0a0c }),
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    const initialLayoutW = root.clientWidth || window.innerWidth;
    const initialNarrowLayout = initialLayoutW < 768;
    /** «Земля»: горизонталь под картиной (мир Y). */
    const groundY = initialNarrowLayout ? -1.1 : -1.42;
    shadowFloor.position.set(0.55, groundY, 0.38);
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    const pictureGroups: THREE.Group[] = [];
    const targetRot = new Map<THREE.Group, { x: number; y: number }>();
    const appearProg = new Map<THREE.Group, number>();

    const disposePictureGroup = (g: THREE.Group) => {
      const pm = g.userData.paintMat as THREE.MeshStandardMaterial | undefined;
      const extra = g.userData.extraMats as THREE.Material[] | undefined;
      const extraTex = g.userData.extraTextures as THREE.Texture[] | undefined;
      const tex = pm?.map ?? null;
      if (pm) {
        pm.map = null;
        pm.dispose();
      }
      if (extra) {
        for (const m of extra) m.dispose();
      }
      tex?.dispose();
      if (extraTex) {
        for (const t of extraTex) t.dispose();
      }
      const geos = g.userData.geometries as THREE.BufferGeometry[] | undefined;
      if (geos) for (const geo of geos) geo.dispose();
      scene.remove(g);
    };

    const fitCameraToPictures = () => {
      const bounds = new THREE.Box3();
      for (const g of pictureGroups) {
        bounds.union(new THREE.Box3().setFromObject(g));
      }
      if (!bounds.isEmpty()) {
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const fovRad = (camera.fov * Math.PI) / 180;
        const halfH = Math.tan(fovRad / 2);
        const halfW = halfH * camera.aspect;
        const distForHeight = size.y / 2 / halfH;
        const distForWidth = size.x / 2 / halfW;
        /* На узком экране чуть дальше камера — картина визуально меньше */
        const isNarrow = (root.clientWidth || window.innerWidth) < 768;
        const slack = isNarrow ? 1.36 : 1.34;
        const dist = Math.max(distForHeight, distForWidth) * slack + 0.08;
        camera.position.set(center.x, center.y, center.z + dist);
        camera.lookAt(center);
      }
    };

    const layoutW = root.clientWidth || window.innerWidth;
    const narrowLayout = layoutW < 768;
    const plateW = narrowLayout ? 2.18 : 3.05;
    const baseAspect = parseAspectRatio(item.aspectRatio);
    const baseHeight = plateW / baseAspect;
    const g = buildFramedPainting(plateW, baseHeight);
    g.position.set(0, 0, 0);
    g.userData.basePos = new THREE.Vector3(0, 0, 0);
    g.userData.aspectStretch = 1;
    g.userData.pictureRoot = true;
    g.userData.id = item.id;
    g.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
      }
    });
    scene.add(g);
    pictureGroups.push(g);
    targetRot.set(g, { x: 0, y: 0 });
    appearProg.set(g, 0);

    const alignPictureToGround = (picture: THREE.Group) => {
      const x = picture.position.x;
      const z = picture.position.z;
      picture.position.set(x, 0, z);
      picture.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(picture);
      const eps = 0.012;
      picture.position.y = groundY - b.min.y + eps;
      (picture.userData.basePos as THREE.Vector3).set(x, picture.position.y, z);
    };
    alignPictureToGround(g);

    fitCameraToPictures();

    runtimeRef.current = {
      texLoader,
      camera,
      picture: g,
      frontMat: g.userData.paintMat as THREE.MeshStandardMaterial,
      plateW,
      baseAspect,
      fitCamera: fitCameraToPictures,
      groundY,
      alignPictureToGround,
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Group | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pictureGroups, true);
      let next: THREE.Group | null = null;
      if (hits.length) {
        let o: THREE.Object3D | null = hits[0].object;
        while (o && !o.userData.pictureRoot) {
          o = o.parent;
        }
        if (o?.userData.pictureRoot) next = o as THREE.Group;
      }
      hovered = next;
      for (const g of pictureGroups) {
        const t = targetRot.get(g);
        if (!t) continue;
        if (g === hovered) {
          t.y = pointer.x * 0.32;
          t.x = pointer.y * 0.28;
        } else {
          t.x = 0;
          t.y = 0;
        }
      }
    };

    const onPointerLeave = () => {
      hovered = null;
      for (const g of pictureGroups) {
        const t = targetRot.get(g);
        if (t) {
          t.x = 0;
          t.y = 0;
        }
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    let scrollTiltX = 0;
    let scrollSpinY = 0;
    /** Доп. подъём в мировых единицах: при скролле вниз картина «обгоняет» страницу */
    let scrollParallaxY = 0;
    const triggerEl =
      root.closest<HTMLElement>("#pictures-gallery") ?? root;
    const scrollSt = ScrollTrigger.create({
          trigger: triggerEl,
          start: "top bottom",
          end: "bottom top",
          scroller: document.documentElement,
          scrub: 0.45,
          onUpdate: (self) => {
            const p = self.progress;
            const off = p - 0.5;
            scrollTiltX = off * 0.28;
            /* Слабый поворот по Y — картина остаётся почти прямо при скролле */
            scrollSpinY = off * 0.38;
            /* Параллакс: сильнее, чем линейный скролл секции (нелинейный усилитель) */
            scrollParallaxY = p * p * 0.34 + p * 0.12;
          },
        });

    let raf = 0;
    let prevLayoutWidth = 0;
    const setSize = () => {
      const w = root.clientWidth;
      const h = Math.max(320, root.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitCameraToPictures();
      if (w !== prevLayoutWidth) {
        prevLayoutWidth = w;
        ScrollTrigger.refresh();
      }
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(root);
    setSize();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!view3dRef.current) {
        return;
      }
      for (const g of pictureGroups) {
        const t = targetRot.get(g);
        if (!t) continue;
        const p = appearProg.get(g) ?? 1;
        const np = p + (1 - p) * 0.075;
        appearProg.set(g, np);
        const eased = 1 - Math.pow(1 - np, 3);
        const base = g.userData.basePos as THREE.Vector3 | undefined;
        if (base) {
          g.position.x = base.x;
          g.position.y = base.y + scrollParallaxY - (1 - eased) * 0.22;
          g.position.z = base.z;
        }
        const baseScale = 0.94 + eased * 0.06;
        const stretch = (g.userData.aspectStretch as number) ?? 1;
        g.scale.set(baseScale, baseScale * stretch, baseScale);
        const baseY = (g.userData.baseRotY as number) ?? 0;
        const baseX = (g.userData.baseRotX as number) ?? 0;
        const targetY = baseY + scrollSpinY + t.y;
        g.rotation.y += (targetY - g.rotation.y) * 0.08;
        const targetX = baseX + scrollTiltX + t.x;
        g.rotation.x += (targetX - g.rotation.x) * 0.08;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      fadeTweenRef.current?.kill();
      fadeTweenRef.current = null;
      scrollSt?.kill();
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      for (const g of [...pictureGroups]) {
        disposePictureGroup(g);
      }
      scene.remove(shadowFloor);
      shadowFloor.geometry.dispose();
      (shadowFloor.material as THREE.Material).dispose();
      pictureGroups.length = 0;
      runtimeRef.current = null;
      prevTextureRef.current = null;
      renderer.dispose();
    };
  }, [item]);

  useEffect(() => {
    setPhotoIdx(0);
  }, [item?.id, photoUrls.join("|")]);

  useEffect(() => {
    if (!item?.src?.trim()) return;
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const nextAspect = parseAspectRatio(item.aspectRatio);
    const scaleY = runtime.baseAspect / nextAspect;
    runtime.picture.userData.aspectStretch = scaleY;
    runtime.picture.userData.id = item.id;
    runtime.alignPictureToGround(runtime.picture);
    runtime.fitCamera();
    textureReqRef.current += 1;
    const reqId = textureReqRef.current;
    const mat = runtime.frontMat;

    const applyTexture = (tex: THREE.Texture) => {
      if (textureReqRef.current !== reqId) {
        tex.dispose();
        return;
      }
      if (runtimeRef.current?.frontMat !== mat) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      const old = prevTextureRef.current;
      fadeTweenRef.current?.kill();
      mat.opacity = 1;
      fadeTweenRef.current = gsap.to(mat, {
        opacity: 0.78,
        duration: 0.11,
        ease: "power2.out",
        onComplete: () => {
          if (textureReqRef.current !== reqId || runtimeRef.current?.frontMat !== mat) {
            tex.dispose();
            return;
          }
          mat.map = tex;
          mat.needsUpdate = true;
          prevTextureRef.current = tex;
          old?.dispose();
          fadeTweenRef.current = gsap.to(mat, {
            opacity: 1,
            duration: 0.14,
            ease: "power2.out",
            onComplete: () => {
              if (textureReqRef.current !== reqId || runtimeRef.current?.frontMat !== mat) {
                return;
              }
              mat.opacity = 1;
            },
          });
        },
      });
    };

    const onErr = () => {
      if (textureReqRef.current !== reqId || runtimeRef.current?.frontMat !== mat) return;
      mat.map = null;
      mat.color.setHex(0x9ca3af);
      mat.opacity = 1;
      mat.needsUpdate = true;
    };

    runtime.texLoader.load(item.src, applyTexture, undefined, onErr);
  }, [item?.id, item?.src, item?.aspectRatio]);

  const gallery = photoUrls.length > 0 ? photoUrls : item?.src ? [item.src] : [];
  const activePhoto = gallery[photoIdx] ?? item?.src ?? "";
  const shown = item ? [item] : [];

  return (
    <div
      ref={rootRef}
      className="relative mx-auto h-[clamp(21rem,58svh,28rem)] min-h-[clamp(21rem,58svh,28rem)] w-[84vw] max-w-[100%] shrink-0 sm:h-[min(74svh,560px)] sm:min-h-[min(74svh,560px)] sm:w-[86vw] md:h-[82svh] md:min-h-[82svh] md:w-[90vw] lg:h-[90dvh] lg:min-h-[90dvh] lg:w-full"
      role="region"
      aria-label="Картины в объёме"
    >
      {item ? (
        <div
          className="absolute right-2 top-2 z-20 flex rounded-full border border-zinc-300/80 bg-zinc-200/55 p-1 shadow-[0_6px_22px_-10px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm dark:border-zinc-600/70 dark:bg-zinc-950/70 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_28px_-10px_rgba(0,0,0,0.55)]"
          role="group"
          aria-label="Режим просмотра"
        >
          <button
            type="button"
            onClick={() => setView3d(true)}
            aria-pressed={view3d}
            className={
              view3d
                ? "min-w-[4.25rem] rounded-full border border-zinc-300/60 bg-gradient-to-b from-white to-zinc-50 px-3 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-zinc-500/50 dark:from-zinc-600 dark:to-zinc-800 dark:text-zinc-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "min-w-[4.25rem] rounded-full px-3 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
            }
          >
            3D
          </button>
          <button
            type="button"
            onClick={() => setView3d(false)}
            aria-pressed={!view3d}
            className={
              !view3d
                ? "min-w-[4.25rem] rounded-full border border-zinc-300/60 bg-gradient-to-b from-white to-zinc-50 px-3 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-zinc-500/50 dark:from-zinc-600 dark:to-zinc-800 dark:text-zinc-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "min-w-[4.25rem] rounded-full px-3 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
            }
          >
            Фото
          </button>
        </div>
      ) : null}
      {!view3d && item ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[linear-gradient(180deg,#e8e6e2_0%,#eceae7_100%)] dark:bg-[linear-gradient(180deg,#1a1f26_0%,#12161c_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto}
            alt={item.alt}
            className="max-h-full max-w-full object-contain px-2 py-4"
          />
          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setPhotoIdx((v) => (v - 1 + gallery.length) % gallery.length)
                }
                className={`absolute left-2 top-1/2 z-20 -translate-y-1/2 ${photoNavBtnClass}`}
                aria-label="Предыдущее фото"
              >
                <ChevronLeftSm />
              </button>
              <button
                type="button"
                onClick={() => setPhotoIdx((v) => (v + 1) % gallery.length)}
                className={`absolute right-2 top-1/2 z-20 -translate-y-1/2 ${photoNavBtnClass}`}
                aria-label="Следующее фото"
              >
                <ChevronRightSm />
              </button>
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-300/85 bg-white/85 px-2.5 py-1.5 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-900/85">
                {gallery.map((_, idx) => (
                  <button
                    key={`photo-dot-${idx}`}
                    type="button"
                    onClick={() => setPhotoIdx(idx)}
                    aria-label={`Показать фото ${idx + 1}`}
                    aria-pressed={idx === photoIdx}
                    className={`h-2 w-2 rounded-full transition ${
                      idx === photoIdx
                        ? "bg-zinc-900 dark:bg-zinc-100"
                        : "bg-zinc-400/75 hover:bg-zinc-500 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full touch-pan-y ${
          view3d ? "" : "pointer-events-none invisible"
        }`}
      />
      <ul className="sr-only">
        {shown.map((it) => (
          <li key={it.id}>{it.alt}</li>
        ))}
      </ul>
      <span className="sr-only" aria-hidden>
        Одна работа в объёме; при скролле — параллакс и поворот; нажмите и ведите
        для наклона.
      </span>
    </div>
  );
}
