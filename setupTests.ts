import "@testing-library/jest-dom/vitest";

// JSDOM doesn't implement IntersectionObserver. Mock it for components that lazily
// observe visibility (e.g., ENSName) so unit tests don't throw at mount time.
class MockIntersectionObserver {
  constructor(
    _callback?: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(global as any).IntersectionObserver =
  (global as any).IntersectionObserver || MockIntersectionObserver;
