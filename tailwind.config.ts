import type { Config } from "tailwindcss";

/**
 * Точки сканирования классов для Tailwind v4.
 * Тема и токены по умолчанию задаются в `view/styles/globals.css` через @theme.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./view/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
