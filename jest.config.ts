import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "node",
  setupFiles: ["./tests/config/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest", // Use babel-jest for TypeScript files
    "^.+\\.(js|jsx|mjs)$": "babel-jest", // Use babel-jest for JS files
    "^.+\\.(svg|jpg|jpeg|png|gif)$": "jest-transform-stub", // Stub asset files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@vercel/otel)/)", // Transform specific modules, include @vercel/otel
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
