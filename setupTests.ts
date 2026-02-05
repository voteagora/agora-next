import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock server-only package for Vitest
vi.mock("server-only", () => ({}));

// Mock next/font/local
vi.mock("next/font/local", () => ({
  default: () => ({
    style: { fontFamily: "MockFont" },
    className: "mock-font",
    variable: "--mock-font",
  }),
}));

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Inter: () => ({
    style: { fontFamily: "Inter" },
    className: "mock-inter",
    variable: "--mock-inter",
  }),
  Rajdhani: () => ({
    style: { fontFamily: "Rajdhani" },
    className: "mock-rajdhani",
    variable: "--mock-rajdhani",
  }),
  Chivo_Mono: () => ({
    style: { fontFamily: "ChivoMono" },
    className: "mock-chivo-mono",
    variable: "--mock-chivo-mono",
  }),
}));
