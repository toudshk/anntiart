export type WorkMeta = {
  title: string;
  medium: string;
  text: string;
  status?: "draft" | "published" | "sold" | "reserved";
  /** Цена в рублях; не задана — на сайте не показываем. */
  priceRub?: number | null;
  /** Дополнительные фото работы: детали, фактура и т.д. */
  detailImageUrls?: string[];
};

export function artworkStatusLabel(status?: WorkMeta["status"]): string | null {
  switch (status) {
    case "draft":
      return "Черновик";
    case "published":
      return "В наличии";
    case "reserved":
      return "Забронировано";
    case "sold":
      return "Продано";
    default:
      return null;
  }
}
