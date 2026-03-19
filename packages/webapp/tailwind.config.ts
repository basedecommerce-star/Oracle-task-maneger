import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: "var(--tg-theme-bg-color, #ffffff)",
          text: "var(--tg-theme-text-color, #000000)",
          hint: "var(--tg-theme-hint-color, #999999)",
          link: "var(--tg-theme-link-color, #2678b6)",
          button: "var(--tg-theme-button-color, #50a8eb)",
          "button-text": "var(--tg-theme-button-text-color, #ffffff)",
          "secondary-bg": "var(--tg-theme-secondary-bg-color, #f0f0f0)",
          "header-bg": "var(--tg-theme-header-bg-color, #527da3)",
          "accent-text": "var(--tg-theme-accent-text-color, #2678b6)",
          "section-bg": "var(--tg-theme-section-bg-color, #ffffff)",
          "section-header": "var(--tg-theme-section-header-text-color, #6d6d72)",
          subtitle: "var(--tg-theme-subtitle-text-color, #999999)",
          destructive: "var(--tg-theme-destructive-text-color, #cc2929)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
