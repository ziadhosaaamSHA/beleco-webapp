import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF6EE",
          100: "#FDEBD7",
          200: "#FBD4AF",
          300: "#F7B57D",
          400: "#F38D43",
          500: "#F0660E", // BASE PRIMARY
          600: "#D64E07",
          700: "#B03908",
          800: "#8C2E0E",
          900: "#73280F",
          950: "#3E1105",
        },
        brand: {
          neutral: {
            50: "#FBF9F8",
            100: "#F5F1EE",
            200: "#E8E0D9",
            300: "#D3C5BA",
            400: "#A89485",
            500: "#7A6658",
            600: "#5D4B3E",
            700: "#46372D",
            800: "#34271F",
            900: "#241A14", // BASE SECONDARY
            950: "#140E0A",
          },
        },
        tertiary: {
          50: "#FDF9F0",
          100: "#FAF0DB",
          200: "#F4DEB3",
          300: "#EDC683",
          400: "#E4AE58",
          500: "#D49B44", // BASE TERTIARY
          600: "#B87B2E",
          700: "#925C23",
          800: "#774921",
          900: "#633E1F",
        },
        success: {
          50: "#F2F9F4",
          500: "#2E8B57",
          700: "#1E5C39",
        },
        danger: {
          50: "#FEF2F2",
          500: "#DC2626",
          700: "#991B1B",
        },
        info: {
          50: "#F0F9FF",
          500: "#0284C7",
          700: "#0369A1",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        editorial: ["var(--font-fraunces)", "var(--font-cairo)", "Cairo", "serif"],
        mono: ["var(--font-manrope)", "var(--font-cairo)", "Cairo", "monospace"],
      },
      boxShadow: {
        floating: "0 14px 30px -14px rgba(36, 26, 20, 0.28)",
        card: "0 2px 8px -2px rgba(36, 26, 20, 0.06), 0 1px 4px -1px rgba(36, 26, 20, 0.04)",
        sheet: "0 -10px 35px rgba(36, 26, 20, 0.15)",
        popover: "0 10px 25px -5px rgba(36, 26, 20, 0.12)",
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
