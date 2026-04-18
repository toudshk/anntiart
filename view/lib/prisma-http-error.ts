import { Prisma } from "@prisma/client";

export type PrismaHttpError = { status: number; error: string };

/** Распознаёт типичные ошибки Prisma и возвращает HTTP-ответ для API. */
export function prismaClientErrorToHttp(err: unknown): PrismaHttpError | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  switch (err.code) {
    case "P2002": {
      const target = err.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String)
        : target != null
          ? [String(target)]
          : [];
      const slugHit =
        fields.includes("slug") || /slug/i.test(String(err.message));
      if (slugHit) {
        return {
          status: 409,
          error:
            "Работа с таким адресом (slug) уже есть. Измените название или откройте существующую запись для правки.",
        };
      }
      return {
        status: 409,
        error: "Конфликт: запись с такими уникальными полями уже существует.",
      };
    }
    case "P2003":
      return {
        status: 400,
        error: "Нельзя выполнить операцию: связанная запись отсутствует или на неё ссылаются другие данные.",
      };
    case "P2025":
      return { status: 404, error: "Запись не найдена." };
    default:
      return null;
  }
}
