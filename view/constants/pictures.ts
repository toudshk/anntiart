/**
 * Статический fallback только для серии из `public/pictures/collection`.
 * Блок отдельных работ на главной странице наполняется только из БД.
 */
export type CollectionHotspot = { x: number; y: number; w: number; h: number };

export type PictureItem = {
  id: string;
  /** путь относительно public или полный URL */
  src: string;
  alt: string;
  /** соотношение сторон области изображения (холст) */
  aspectRatio?: `${number}/${number}`;
  /** блок на лендинге: отдельные работы или серия из `pictures/collection` */
  section: "works" | "collection";
  /** Фрагмент коллекции: зона на общей композиции (в процентах). */
  hotspot?: CollectionHotspot;
  /** Главное изображение интерактивного блока коллекции. */
  isCollectionComposite?: boolean;
  /** Группа с БД: одно значение у композиции и её фрагментов. */
  collectionSeriesKey?: string | null;
  /** Порядок в выдаче (из БД). */
  sortOrder?: number;
};

export const PICTURE_ITEMS: PictureItem[] = [
  {
    id: "collection-one",
    src: "/pictures/collection/one.jpg",
    alt: "Черновики личности — фрагмент 1",
    aspectRatio: "2/3",
    section: "collection",
    hotspot: { x: 40, y: 7, w: 14, h: 15 },
  },
  {
    id: "collection-two",
    src: "/pictures/collection/two.jpg",
    alt: "Черновики личности — фрагмент 2",
    aspectRatio: "2/3",
    section: "collection",
    hotspot: { x: 35, y: 25, w: 22, h: 15 },
  },
  {
    id: "collection-three",
    src: "/pictures/collection/three.jpg",
    alt: "Черновики личности — фрагмент 3",
    aspectRatio: "2/3",
    section: "collection",
    hotspot: { x: 80, y: 44, w: 22, h: 15 },
  },
  {
    id: "collection-four",
    src: "/pictures/collection/four.jpg",
    alt: "Черновики личности — фрагмент 4",
    aspectRatio: "2/3",
    section: "collection",
    hotspot: { x: 1, y: 43, w: 21, h: 14 },
  },
  {
    id: "collection-five",
    src: "/pictures/collection/five.jpg",
    alt: "Черновики личности — фрагмент 5",
    aspectRatio: "2/3",
    section: "collection",
    hotspot: { x: 24, y: 48, w: 21, h: 17 },
  },
  {
    id: "collection-interesting-positions",
    src: "/pictures/collection/interesting-positions.jpg",
    alt: "Черновики личности — общая композиция",
    aspectRatio: "2/3",
    section: "collection",
    isCollectionComposite: true,
  },
];
