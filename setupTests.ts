import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock server-only package for Vitest
vi.mock("server-only", () => ({}));
