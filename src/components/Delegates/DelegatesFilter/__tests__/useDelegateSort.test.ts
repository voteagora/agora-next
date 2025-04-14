import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useDelegatesSort } from "../useDelegatesSort";
import { delegatesFilterOptions } from "@/lib/constants";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";

// Mock the AgoraContext
const mockSetIsDelegatesFiltering = vi.fn();
vi.mock("@/contexts/AgoraContext", () => ({
  useAgoraContext: () => ({
    setIsDelegatesFiltering: mockSetIsDelegatesFiltering,
  }),
}));

describe("useDelegatesSort", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should return the default orderByParam when no search param exists", () => {
    const { result } = renderHook(() => useDelegatesSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    expect(result.current.orderByParam).toBe("weighted_random");
  });

  it("should return the correct orderByParam when search param exists", () => {
    const { result } = renderHook(() => useDelegatesSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "?orderBy=votes" }),
    });

    expect(result.current.orderByParam).toBe("votes");
  });

  it("should call setIsDelegatesFiltering when handleSortChange is called with weighted_random", async () => {
    const { result } = renderHook(() => useDelegatesSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "?orderBy=votes" }),
    });

    await act(async () => {
      await result.current.handleSortChange(delegatesFilterOptions.weightedRandom.sort);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
  });

  it("should call setIsDelegatesFiltering when handleSortChange is called with a non-default value", async () => {
    const { result } = renderHook(() => useDelegatesSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    await act(async () => {
      await result.current.handleSortChange("votes");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    
    // Check that the orderByParam was updated
    expect(result.current.orderByParam).toBe("votes");
  });

  it("should call setIsDelegatesFiltering when resetSort is called", async () => {
    const { result } = renderHook(() => useDelegatesSort(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "?orderBy=votes" }),
    });

    // Verify initial value
    expect(result.current.orderByParam).toBe("votes");

    await act(async () => {
      await result.current.resetSort();
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    
    // Verify the value was reset
    expect(result.current.orderByParam).toBe("weighted_random");
  });
});
