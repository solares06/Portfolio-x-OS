import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ── Colors ── */
      colors: {
        /* Backward-compatible tokens */
        background: "var(--bg-color)",
        foreground: "var(--text-color)",
        card: {
          DEFAULT: "var(--card-bg)",
          border: "var(--card-border-color)",
        },

        /* M3 Surface system */
        surface: {
          DEFAULT: "var(--surface, #131315)",
          dim: "var(--surface-dim, #131315)",
          bright: "var(--surface-bright, #39393b)",
          tint: "var(--surface-tint, #00dbe7)",
          variant: "var(--surface-variant, #353437)",
          "container-lowest": "var(--surface-container-lowest, #0e0e10)",
          "container-low": "var(--surface-container-low, #1c1b1d)",
          container: "var(--surface-container, #201f21)",
          "container-high": "var(--surface-container-high, #2a2a2c)",
          "container-highest": "var(--surface-container-highest, #353437)",
        },

        /* M3 Primary */
        primary: {
          DEFAULT: "var(--primary-color)",
          container: "var(--primary-container, #00f2ff)",
          fixed: "var(--primary-fixed, #74f5ff)",
          "fixed-dim": "var(--primary-fixed-dim, #00dbe7)",
        },

        /* M3 Secondary */
        secondary: {
          DEFAULT: "var(--secondary, #d1bcff)",
          container: "var(--secondary-container, #7000ff)",
        },

        /* M3 Tertiary */
        tertiary: {
          DEFAULT: "var(--tertiary, #fff6e4)",
          container: "var(--tertiary-container, #fed83a)",
        },

        /* M3 Error */
        error: {
          DEFAULT: "var(--error, #ffb4ab)",
          container: "var(--error-container, #93000a)",
        },

        /* M3 Outline */
        outline: {
          DEFAULT: "var(--outline, #849495)",
          variant: "var(--outline-variant, #3a494b)",
        },

        /* M3 On- tokens */
        "on-surface": "var(--on-surface, var(--text-color))",
        "on-surface-variant": "var(--on-surface-variant, #b9cacb)",
        "on-background": "var(--on-background, var(--text-color))",
        "on-primary": "var(--on-primary, #00363a)",
        "on-primary-container": "var(--on-primary-container, #006a71)",
        "on-secondary-container": "var(--on-secondary-container, #ddcdff)",
        "on-tertiary-container": "var(--on-tertiary-container, #725e00)",
        "on-error-container": "var(--on-error-container, #ffdad6)",

        /* Inverse */
        "inverse-surface": "var(--inverse-surface, #e5e1e4)",
        "inverse-on-surface": "var(--inverse-on-surface, #313032)",

        /* Alias */
        muted: "var(--on-surface-variant, #b9cacb)",
      },

      /* ── Typography ── */
      fontFamily: {
        sans: ["var(--font-geist-sans)", "var(--font-inter)", "sans-serif"],
        display: ["var(--font-geist-sans)", "var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "var(--font-jetbrains-mono)", "monospace"],
        /* M3 type-scale families */
        "headline-md": ["var(--font-geist-sans)", "sans-serif"],
        "body-sm": ["var(--font-geist-sans)", "sans-serif"],
        "body-lg": ["var(--font-geist-sans)", "sans-serif"],
        "label-caps": ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "monospace"],
        "code-sm": ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "monospace"],
      },

      /* ── Font Size (M3 type scale) ── */
      fontSize: {
        label: ["12px", { lineHeight: "16px", letterSpacing: "0.1em" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-sm": ["14px", { lineHeight: "1.5" }],
        "body-lg": ["16px", { lineHeight: "1.6" }],
        "label-caps": ["12px", { lineHeight: "1.4", letterSpacing: "0.1em" }],
        "code-sm": ["13px", { lineHeight: "1.5" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },

      /* ── Spacing (4px baseline grid) ── */
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        gutter: "24px",
        "gutter-mobile": "16px",
        "sidebar-width": "280px",
        "margin-desktop": "32px",
        "margin-mobile": "16px",
      },

      /* ── Layout ── */
      maxWidth: {
        layout: "1440px",
      },

      /* ── Border Radius ── */
      borderRadius: {
        theme: "var(--card-radius)",
        base: "0.25rem",
        card: "0.5rem",
      },

      /* ── Box Shadows ── */
      boxShadow: {
        theme: "var(--card-shadow)",
        glow: "var(--glow-primary, 0 0 12px rgba(0,242,255,0.3))",
        none: "none",
      },

      /* ── Backdrop Blur ── */
      backdropBlur: {
        surface: "12px",
      },

      /* ── Letter Spacing ── */
      letterSpacing: {
        label: "0.1em",
      },
    },
  },
  plugins: [],
};
export default config;
