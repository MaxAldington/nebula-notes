import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.light.primary,
        secondary: designTokens.colors.light.secondary,
        accent: designTokens.colors.light.accent,
        background: designTokens.colors.light.background,
        surface: designTokens.colors.light.surface,
        text: designTokens.colors.light.text,
        "text-secondary": designTokens.colors.light.textSecondary,
        border: designTokens.colors.light.border,
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.sizes,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      transitionDuration: {
        DEFAULT: `${designTokens.transitions.duration}ms`,
      },
    },
  },
  plugins: [],
};

export default config;

