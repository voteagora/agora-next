import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useDelegatesSort } from "../useDelegatesSort";
import { delegatesFilterOptions } from "@/lib/constants";

// Mock the required dependencies
const mockRouter = {
  push: vi.fn(),
};

const mockSearchParams = {
  get: vi.fn(),
};

const mockAddSearchParam = vi.fn();
const mockDeleteSearchParam = vi.fn();
const mockSetIsDelegatesFiltering = vi.fn();

// Setup mocks
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/hooks", () => ({
  useAddSearchParam: () => mockAddSearchParam,
  useDeleteSearchParam: () => mockDeleteSearchParam,
}));

vi.mock("@/contexts/AgoraContext", () => ({
  useAgoraContext: () => ({
    setIsDelegatesFiltering: mockSetIsDelegatesFiltering,
  }),
}));

describe("useDelegatesSort", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    mockRouter.push.mockImplementation(() => {});
    mockSearchParams.get.mockImplementation((param) => {
      if (param === "orderBy") return null;
      return null;
    });
    mockAddSearchParam.mockImplementation(
      (params) => `add-${params.name}-${params.value}`
    );
    mockDeleteSearchParam.mockImplementation(
      (params) => `delete-${params.name}`
    );
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should return the default orderByParam when no search param exists", () => {
    mockSearchParams.get.mockReturnValue(null);

    const { result } = renderHook(() => useDelegatesSort());

    expect(result.current.orderByParam).toBe("weighted_random");
    expect(mockSearchParams.get).toHaveBeenCalledWith("orderBy");
  });

  it("should return the correct orderByParam when search param exists", () => {
    mockSearchParams.get.mockReturnValue("votes");

    const { result } = renderHook(() => useDelegatesSort());

    expect(result.current.orderByParam).toBe("votes");
    expect(mockSearchParams.get).toHaveBeenCalledWith("orderBy");
  });

  it("should call setIsDelegatesFiltering and router.push when handleSortChange is called with weighted_random", () => {
    mockSearchParams.get.mockReturnValue(null);
    mockDeleteSearchParam.mockReturnValue("delete-orderBy");

    const { result } = renderHook(() => useDelegatesSort());

    act(() => {
      result.current.handleSortChange(
        delegatesFilterOptions.weightedRandom.sort
      );
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({ name: "orderBy" });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-orderBy", {
      scroll: false,
    });
  });

  it("should call setIsDelegatesFiltering and router.push with addSearchParam when handleSortChange is called with a non-default value", () => {
    mockSearchParams.get.mockReturnValue(null);
    mockAddSearchParam.mockReturnValue("add-orderBy-votes");

    const { result } = renderHook(() => useDelegatesSort());

    act(() => {
      result.current.handleSortChange("votes");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockAddSearchParam).toHaveBeenCalledWith({
      name: "orderBy",
      value: "votes",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("add-orderBy-votes", {
      scroll: false,
    });
  });

  it("should call setIsDelegatesFiltering and router.push with deleteSearchParam when resetSort is called", () => {
    mockSearchParams.get.mockReturnValue("votes");
    mockDeleteSearchParam.mockReturnValue("delete-orderBy");

    const { result } = renderHook(() => useDelegatesSort());

    act(() => {
      result.current.resetSort();
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({ name: "orderBy" });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-orderBy", {
      scroll: false,
    });
  });
});
