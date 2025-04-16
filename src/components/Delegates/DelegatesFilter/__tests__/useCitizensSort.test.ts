import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useCitizensSort } from "../useCitizensSort";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";

// Mock the AgoraContext
const mockSetIsDelegatesFiltering = vi.fn();
vi.mock("@/contexts/AgoraContext", () => ({
  useAgoraContext: () => ({
    setIsDelegatesFiltering: mockSetIsDelegatesFiltering,
  }),
}));

describe("useCitizensSort", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console.log to reduce test output noise
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should return the default orderByParam when no search param exists", () => {
    const { result } = renderHook(() => useCitizensSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    expect(result.current.orderByParam).toBe("shuffle");
  });

  it("should return the correct orderByParam when search param exists", () => {
    const { result } = renderHook(() => useCitizensSort(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?citizensOrderBy=votes",
      }),
    });

    expect(result.current.orderByParam).toBe("votes");
  });

  it("should clear the parameter when handleSortChange is called with shuffle", async () => {
    const { result } = renderHook(() => useCitizensSort(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?citizensOrderBy=votes",
      }),
    });

    // Verify initial value
    expect(result.current.orderByParam).toBe("votes");

    await act(async () => {
      await result.current.handleSortChange("shuffle");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);

    // Verify the parameter was cleared (null becomes the default value)
    expect(result.current.orderByParam).toBe("shuffle");
  });

  it("should update the parameter when handleSortChange is called with a non-default value", async () => {
    const { result } = renderHook(() => useCitizensSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    // Verify initial value is the default
    expect(result.current.orderByParam).toBe("shuffle");

    await act(async () => {
      await result.current.handleSortChange("votes");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);

    // Check that the orderByParam was updated
    expect(result.current.orderByParam).toBe("votes");
  });

  it("should clear the parameter when resetSort is called", async () => {
    const { result } = renderHook(() => useCitizensSort(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?citizensOrderBy=votes",
      }),
    });

    // Verify initial value
    expect(result.current.orderByParam).toBe("votes");

    await act(async () => {
      await result.current.resetSort();
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);

    // Verify the value was reset to default
    expect(result.current.orderByParam).toBe("shuffle");
  });
});
