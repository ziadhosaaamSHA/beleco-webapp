import type { Config } from "tailwindcss";

/**
 * Helper to compute 50-950 color shades using native CSS color-mix percentages.
 * - 50..400: progressively mixed with white (percentage tint)
 * - 500: pure base token
 * - 600..950: progressively mixed with black (percentage shade)
 */
function createColorScale(cssVar: string) {
  return {
    50: `color-mix(in srgb, var(${cssVar}) 6%, white)`,
    100: `color-mix(in srgb, var(${cssVar}) 14%, white)`,
    200: `color-mix(in srgb, var(${cssVar}) 28%, white)`,
    300: `color-mix(in srgb, var(${cssVar}) 48%, white)`,
    400: `color-mix(in srgb, var(${cssVar}) 72%, white)`,
    500: `var(${cssVar})`,
    600: `color-mix(in srgb, var(${cssVar}) 85%, black)`,
    700: `color-mix(in srgb, var(${cssVar}) 70%, black)`,
    800: `color-mix(in srgb, var(${cssVar}) 55%, black)`,
    900: `color-mix(in srgb, var(${cssVar}) 40%, black)`,
    950: `color-mix(in srgb, var(${cssVar}) 20%, black)`,
    DEFAULT: `var(${cssVar})`,
  };
}

/**
 * Helper to compute neutral earth scale (where 900 is base espresso, 50 is near-white canvas).
 */
function createNeutralScale(cssVar: string) {
  return {
    50: `color-mix(in srgb, var(${cssVar}) 3%, white)`,
    100: `color-mix(in srgb, var(${cssVar}) 6%, white)`,
    200: `color-mix(in srgb, var(${cssVar}) 14%, white)`,
    300: `color-mix(in srgb, var(${cssVar}) 26%, white)`,
    400: `color-mix(in srgb, var(${cssVar}) 45%, white)`,
    500: `color-mix(in srgb, var(${cssVar}) 62%, white)`,
    600: `color-mix(in srgb, var(${cssVar}) 75%, white)`,
    700: `color-mix(in srgb, var(${cssVar}) 85%, white)`,
    800: `color-mix(in srgb, var(${cssVar}) 92%, white)`,
    900: `var(${cssVar})`,
    950: `color-mix(in srgb, var(${cssVar}) 65%, black)`,
    DEFAULT: `var(${cssVar})`,
  };
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: createColorScale("--color-primary"),
        brand: {
          neutral: createNeutralScale("--color-neutral"),
        },
        tertiary: createColorScale("--color-tertiary"),
        success: {
          50: `color-mix(in srgb, var(--color-success) 8%, white)`,
          500: `var(--color-success)`,
          700: `color-mix(in srgb, var(--color-success) 70%, black)`,
          DEFAULT: `var(--color-success)`,
        },
        danger: {
          50: `color-mix(in srgb, var(--color-danger) 8%, white)`,
          500: `var(--color-danger)`,
          700: `color-mix(in srgb, var(--color-danger) 70%, black)`,
          DEFAULT: `var(--color-danger)`,
        },
        info: {
          50: `color-mix(in srgb, var(--color-info) 8%, white)`,
          500: `var(--color-info)`,
          700: `color-mix(in srgb, var(--color-info) 70%, black)`,
          DEFAULT: `var(--color-info)`,
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
