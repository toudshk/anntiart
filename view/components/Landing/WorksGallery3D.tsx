"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

import type { PictureItem } from "view/constants/pictures";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  item: PictureItem | null;
};

function parseAspectRatio(ar: string | undefined): number {
  if (!ar || !ar.includes("/")) return 3 / 4;
  const [a, b] = ar.split("/").map(Number);
  if (!a || !b) return 3 / 4;
  return a / b;
}

function colsForWidth(w: number): number {
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

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

function createSceneAccents() {
  const group = new THREE.Group();
  const meshes: THREE.Mesh[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const monoGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
  const monoMat = new THREE.MeshStandardMaterial({
    color: 0xcfcfcf,
    roughness: 0.72,
    metalness: 0.02,
    transparent: true,
    opacity: 0.3,
  });
  geos.push(monoGeo);
  mats.push(monoMat);

  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(monoGeo, monoMat);
    const px = (Math.random() - 0.5) * 6.2;
    const py = (Math.random() - 0.5) * 3.8;
    const pz = -0.55 - Math.random() * 1.05;
    m.position.set(px, py, pz);
    const s = 0.42 + Math.random() * 0.9;
    m.scale.set(s, s * (0.75 + Math.random() * 0.35), s);
    m.rotation.set(Math.random() * 0.8, Math.random() * 0.8, Math.random() * 0.8);
    m.userData.basePos = m.position.clone();
    m.userData.seed = Math.random() * Math.PI * 2;
    m.userData.speed = 0.2 + Math.random() * 0.45;
    group.add(m);
    meshes.push(m);
  }

  group.userData.meshes = meshes;
  group.userData.geometries = geos;
  group.userData.materials = mats;
  return group;
}

function disposeSceneAccents(scene: THREE.Scene, group: THREE.Group) {
  const geos = group.userData.geometries as THREE.BufferGeometry[] | undefined;
  const mats = group.userData.materials as THREE.Material[] | undefined;
  if (geos) for (const g of geos) g.dispose();
  if (mats) for (const m of mats) m.dispose();
  scene.remove(group);
}

/**
 * Объёмный параллелепипед без скруглений: одна текстура по всему мешу.
 * Базовый поворот — стоящий «портрет», чуть развёрнут к камере.
 */
function buildFramedPainting(
  canvasW: number,
  canvasH: number,
  src: string,
  texLoader: THREE.TextureLoader,
): THREE.Group {
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

  const applyTex = (tex: THREE.Texture) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    frontMat.map = tex;
    frontMat.needsUpdate = true;
  };

  const onErr = () => {
    frontMat.map = null;
    frontMat.color.setHex(0x9ca3af);
    frontMat.needsUpdate = true;
  };

  texLoader.load(src, applyTex, undefined, onErr);

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
export function WorksGallery3D({ item }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);
  const textureReqRef = useRef(0);
  const runtimeRef = useRef<{
    texLoader: THREE.TextureLoader;
    camera: THREE.PerspectiveCamera;
    picture: THREE.Group;
    frontMat: THREE.MeshStandardMaterial;
    plateW: number;
    baseAspect: number;
    fitCamera: () => void;
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
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 120);
    const texLoader = new THREE.TextureLoader();

    const ambient = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff5e6, 0.58);
    dir.position.set(2.2, 3.8, 4.5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.18);
    fill.position.set(-3, 0.5, 2);
    scene.add(fill);
    const accents = createSceneAccents();
    scene.add(accents);

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
        const slack = 1.34;
        const dist = Math.max(distForHeight, distForWidth) * slack + 0.08;
        camera.position.set(center.x, center.y, center.z + dist);
        camera.lookAt(center);
      }
    };

    const plateW = 3.05;
    const baseAspect = parseAspectRatio(item.aspectRatio);
    const baseHeight = plateW / baseAspect;
    const g = buildFramedPainting(plateW, baseHeight, item.src, texLoader);
    g.position.set(0, 0, 0);
    g.userData.basePos = new THREE.Vector3(0, 0, 0);
    g.userData.pictureRoot = true;
    g.userData.id = item.id;
    scene.add(g);
    pictureGroups.push(g);
    targetRot.set(g, { x: 0, y: 0 });
    appearProg.set(g, 0);
    fitCameraToPictures();

    runtimeRef.current = {
      texLoader,
      camera,
      picture: g,
      frontMat: g.userData.paintMat as THREE.MeshStandardMaterial,
      plateW,
      baseAspect,
      fitCamera: fitCameraToPictures,
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
    const setSize = () => {
      const w = root.clientWidth;
      const h = Math.max(320, root.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitCameraToPictures();
      ScrollTrigger.refresh();
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(root);
    setSize();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const tSec = performance.now() * 0.001;
      const accentMeshes = accents.userData.meshes as THREE.Mesh[] | undefined;
      if (accentMeshes) {
        for (const m of accentMeshes) {
          const base = m.userData.basePos as THREE.Vector3 | undefined;
          const seed = (m.userData.seed as number) ?? 0;
          const speed = (m.userData.speed as number) ?? 0.35;
          if (!base) continue;
          const tt = tSec * speed + seed;
          m.position.x = base.x + Math.sin(tt) * 0.03;
          m.position.y = base.y + Math.cos(tt * 1.25) * 0.05;
          m.position.z = base.z + Math.sin(tt * 0.8) * 0.02;
          m.rotation.z += 0.0012;
        }
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
        g.scale.setScalar(baseScale);
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
      disposeSceneAccents(scene, accents);
      pictureGroups.length = 0;
      runtimeRef.current = null;
      prevTextureRef.current = null;
      renderer.dispose();
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const nextAspect = parseAspectRatio(item.aspectRatio);
    const scaleY = runtime.baseAspect / nextAspect;
    runtime.picture.scale.y = scaleY;
    runtime.picture.userData.id = item.id;
    runtime.fitCamera();
    textureReqRef.current += 1;
    const reqId = textureReqRef.current;

    runtime.texLoader.load(
      item.src,
      (tex) => {
        if (textureReqRef.current !== reqId) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        const mat = runtime.frontMat;
        const old = prevTextureRef.current;
        fadeTweenRef.current?.kill();
        fadeTweenRef.current = gsap.to(mat, {
          opacity: 0.78,
          duration: 0.11,
          ease: "power2.out",
          onComplete: () => {
            runtime.frontMat.map = tex;
            runtime.frontMat.needsUpdate = true;
            prevTextureRef.current = tex;
            old?.dispose();
            fadeTweenRef.current = gsap.to(mat, {
              opacity: 1,
              duration: 0.14,
              ease: "power2.out",
            });
          },
        });
      },
      undefined,
      () => {
        // При ошибке не сбрасываем текущую текстуру, чтобы не было белой вспышки.
      },
    );
  }, [item?.id, item?.src, item?.aspectRatio]);

  const shown = item ? [item] : [];

  return (
    <div
      ref={rootRef}
      className="relative mx-auto h-[95dvh] min-h-[95dvh] w-[95vw] max-w-[100%] shrink-0 lg:h-[90dvh] lg:min-h-[90dvh] lg:w-full"
      role="region"
      aria-label="Картины в объёме"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-pan-y"
      />
      <ul className="sr-only">
        {shown.map((it) => (
          <li key={it.id}>{it.alt}</li>
        ))}
      </ul>
      <span className="sr-only" aria-hidden>
        Одна работа в объёме; при скролле — параллакс и поворот; наведите курсор
        для наклона.
      </span>
    </div>
  );
}
