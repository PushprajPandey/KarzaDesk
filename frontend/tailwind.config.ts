import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface colors
        surface: "#f5faf8",
        "surface-dim": "#d6dbd9",
        "surface-bright": "#f5faf8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f5f2",
        "surface-container": "#eaefed",
        "surface-container-high": "#e4e9e7",
        "surface-container-highest": "#dee4e1",
        "on-surface": "#171d1c",
        "on-surface-variant": "#3d4947",
        "inverse-surface": "#2c3130",
        "inverse-on-surface": "#edf2f0",
        outline: "#6d7a77",
        "outline-variant": "#bcc9c6",
        "surface-tint": "#006a61",
        "surface-variant": "#dee4e1",
        background: "#f5faf8",
        "on-background": "#171d1c",

        // Primary colors (Teal/Emerald)
        primary: "#00685f",
        "on-primary": "#ffffff",
        "primary-container": "#008378",
        "on-primary-container": "#f4fffc",
        "inverse-primary": "#6bd8cb",
        "primary-fixed": "#89f5e7",
        "primary-fixed-dim": "#6bd8cb",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#005049",

        // Secondary colors (Violet)
        secondary: "#712ae2",
        "on-secondary": "#ffffff",
        "secondary-container": "#8a4cfc",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#eaddff",
        "secondary-fixed-dim": "#d2bbff",
        "on-secondary-fixed": "#25005a",
        "on-secondary-fixed-variant": "#5a00c6",

        // Tertiary colors
        tertiary: "#924628",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#b05e3d",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb59a",
        "on-tertiary-fixed": "#370e00",
        "on-tertiary-fixed-variant": "#773215",

        // Error colors
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        h1: ["Manrope"],
        h2: ["Manrope"],
        h3: ["Manrope"],
        h4: ["Manrope"],
        "body-lg": ["Manrope"],
        "body-md": ["Manrope"],
        "body-sm": ["Manrope"],
        "body-xs": ["Manrope"],
        "label-md": ["Manrope"],
        "label-sm": ["Manrope"],
      },
      fontSize: {
        h1: [
          "48px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h2: [
          "36px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h3: [
          "24px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h4: [
          "20px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-xs": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        "label-md": [
          "14px",
          { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "label-sm": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        unit: "8px",
        "container-max": "1280px",
        gutter: "24px",
        "margin-page": "32px",
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "stack-xl": "48px",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
