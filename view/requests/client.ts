import axios, { type AxiosError } from "axios";

function zodDetailsMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
  const msgs = [
    ...(d.formErrors ?? []),
    ...Object.values(d.fieldErrors ?? {}).flat(),
  ].filter(Boolean);
  return msgs.length > 0 ? msgs.join(". ") : null;
}

function messageFromResponseData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const fromDetails = zodDetailsMessage(
    "details" in data ? (data as { details: unknown }).details : null,
  );
  if (fromDetails) return fromDetails;

  if ("error" in data) {
    const v = (data as { error: unknown }).error;
    if (typeof v === "string" && v !== "Invalid payload") return v;
  }
  return null;
}

/** Текст ошибки из ответа API или сети (для UI). */
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: string }>;
    const fromBody = ax.response?.data
      ? messageFromResponseData(ax.response.data)
      : null;
    if (fromBody) return fromBody;
    if (ax.response?.status) {
      return `Запрос не удался (${ax.response.status})`;
    }
    return ax.message || "Сеть недоступна";
  }
  if (err instanceof Error) return err.message;
  return "Неизвестная ошибка";
}

/**
 * Клиент для same-origin admin API (куки сессии NextAuth).
 */
export const adminApi = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Cache-Control": "no-cache",
  },
});
