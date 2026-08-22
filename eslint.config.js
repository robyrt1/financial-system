import js from "@eslint/js";
import globals from "globals";
import { reactConfig } from "./packages/eslint-config/react.js";
import { baseConfig } from "./packages/eslint-config/base.js";

export default [
  // Global ignores to skip build output and dependencies
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/tmp-deploy/**",
      "**/build/**",
      "apps/web/front/dist/**",
      "scripts/**",
    ],
  },

  // Node packages Config (without type-checking to prevent TypeScript 5.9 compatibility crashes)
  ...baseConfig.map((config) => ({
    ...config,
    files: [
      "apps/backend/api-gateway/**/*.{ts,js}",
      "apps/backend/auth-service/**/*.{ts,js}",
    ],
    languageOptions: {
      ...config.languageOptions,
      globals: {
        ...config.languageOptions?.globals,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),

  // React Frontend Config
  ...reactConfig.map((config) => ({
    ...config,
    files: ["apps/web/front/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),

  // Shared packages Config
  ...baseConfig.map((config) => ({
    ...config,
    files: ["packages/**/*.{ts,js}"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),

  // Root level configuration files & scripts
  {
    files: ["*.{js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
  },
];
