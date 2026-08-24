import type { Config } from "tailwindcss";

const shades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

const makeScale = (name: string) => {
  return shades.reduce((acc: Record<string, string>, shade) => {
    acc[shade] = `var(--color-${name}-${shade})`;
    return acc;
  }, {});
};

export default {
  darkMode: "class",
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* 16 Escalas Completas (176 Cores Exatas) */
        navy: makeScale("navy"),
        cyan: makeScale("cyan"),
        blue: makeScale("blue"),
        sky: makeScale("sky"),
        emerald: makeScale("emerald"),
        green: makeScale("green"),
        red: makeScale("red"),
        rose: makeScale("rose"),
        amber: makeScale("amber"),
        yellow: makeScale("yellow"),
        purple: makeScale("purple"),
        violet: makeScale("violet"),
        indigo: makeScale("indigo"),
        fuchsia: makeScale("fuchsia"),
        orange: makeScale("orange"),
        teal: makeScale("teal"),
        slate: makeScale("slate"),

        /* Aliases de Estrutura & Layout */
        surface: {
          base: "var(--color-bg-base)",
          panel: "var(--color-bg-surface)",
          card: "var(--color-bg-card)",
          hover: "var(--color-bg-card-hover)",
        },
        content: {
          title: "var(--color-text-title)",
          body: "var(--color-text-body)",
          muted: "var(--color-text-muted)",
        },
        stroke: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },

        /* Atalhos Semânticos */
        semantic: {
          success: {
            DEFAULT: "var(--semantic-success-fg)",
            bg: "var(--semantic-success-bg)",
            border: "var(--semantic-success-border)",
          },
          danger: {
            DEFAULT: "var(--semantic-danger-fg)",
            bg: "var(--semantic-danger-bg)",
            border: "var(--semantic-danger-border)",
          },
          warning: {
            DEFAULT: "var(--semantic-warning-fg)",
            bg: "var(--semantic-warning-bg)",
            border: "var(--semantic-warning-border)",
          },
          info: {
            DEFAULT: "var(--semantic-info-fg)",
            bg: "var(--semantic-info-bg)",
            border: "var(--semantic-info-border)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-primary)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
} satisfies Config;
