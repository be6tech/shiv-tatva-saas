import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React 19 + App Router apps frequently hydrate state in effects.
      // This rule is too noisy for typical auth/data-fetch flows.
      "react-hooks/set-state-in-effect": "off",
      // We use explicit types; allow `any` only where integrating with external services
      // or early in prototype endpoints.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
