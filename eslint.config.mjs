import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next 16 bundles eslint-plugin-react-hooks v7, which enables the
// new React Compiler analysis rules by default. Adopting them is a separate effort;
// preserve the pre-upgrade lint contract (rules-of-hooks + exhaustive-deps only).
const reactCompilerRulesOff = Object.fromEntries(
  [
    "react-hooks/set-state-in-effect",
    "react-hooks/set-state-in-render",
    "react-hooks/no-deriving-state-in-effects",
    "react-hooks/purity",
    "react-hooks/immutability",
    "react-hooks/refs",
    "react-hooks/globals",
    "react-hooks/preserve-manual-memoization",
    "react-hooks/memoized-effect-dependencies",
    "react-hooks/exhaustive-effect-dependencies",
    "react-hooks/incompatible-library",
    "react-hooks/error-boundaries",
    "react-hooks/static-components",
    "react-hooks/use-memo",
    "react-hooks/void-use-memo",
    "react-hooks/memo-dependencies",
    "react-hooks/component-hook-factories",
    "react-hooks/capitalized-calls",
    "react-hooks/gating",
  ].map((rule) => [rule, "off"])
);

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: reactCompilerRulesOff,
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      ".vercel/**",
      "build/**",
      "out/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      "public/**",
      "src/lib/contracts/generated/**",
    ],
  },
];

export default eslintConfig;
