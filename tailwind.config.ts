import type { Config } from "tailwindcss";

/**
 * checkedOut visual language: editorial, warm, a little raw.
 * Paper background + ink text + a confident highlighter accent.
 * The opposite of corporate-blue LinkedIn.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#faf7f1",
        ink: "#1c1a17",
        muted: "#6b655c",
        line: "#e7e1d6",
        accent: {
          DEFAULT: "#e8590c", // highlighter amber
          soft: "#fde7d3",
        },
        respect: "#2f6f4f",
        contested: "#b42318",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        feed: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
