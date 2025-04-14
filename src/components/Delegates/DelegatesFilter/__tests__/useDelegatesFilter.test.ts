import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useDelegatesFilter } from "../useDelegatesFilter";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";

// Mock the required dependencies
const mockSetIsDelegatesFiltering = vi.fn();
const mockConnectedAddress = "0x1234567890abcdef1234567890abcdef12345678";

// Mock Tenant
const mockTenant = {
  ui: {
    governanceIssues: [] as any[],
    governanceStakeholders: [] as any[],
    toggle: vi.fn(),
  },
};

// Setup mocks
vi.mock("@/contexts/AgoraContext", () => ({
  useAgoraContext: () => ({
    setIsDelegatesFiltering: mockSetIsDelegatesFiltering,
  }),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: mockConnectedAddress,
    isConnected: true,
  }),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => mockTenant,
  },
}));

describe("useDelegatesFilter", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset tenant mock
    mockTenant.ui.governanceIssues = [];
    mockTenant.ui.governanceStakeholders = [];
    mockTenant.ui.toggle.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    expect(result.current.activeFilters).toEqual([]);
    expect(result.current.hasIssues).toBe(false);
    expect(result.current.hasStakeholders).toBe(false);
    expect(result.current.issuesFromUrl).toEqual([]);
    expect(result.current.stakeholdersFromUrl).toEqual([]);
    expect(result.current.hasEndorsedFilter).toBe(false);
  });

  it("should detect issues and stakeholders from tenant config", () => {
    mockTenant.ui.governanceIssues = ["issue1", "issue2"];
    mockTenant.ui.governanceStakeholders = ["stakeholder1"];

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    expect(result.current.hasIssues).toBe(true);
    expect(result.current.hasStakeholders).toBe(true);
  });

  it("should detect endorsed filter from tenant config", () => {
    mockTenant.ui.toggle.mockReturnValue({
      enabled: true,
      config: { label: "Endorsed" },
    });

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    expect(result.current.hasEndorsedFilter).toBe(true);
    expect(result.current.endorsedToggleConfig).toEqual({ label: "Endorsed" });
  });

  it("should set active filters based on URL params", () => {
    const searchParams = `?${ENDORSED_FILTER_PARAM}=true&${HAS_STATEMENT_FILTER_PARAM}=true&${MY_DELEGATES_FILTER_PARAM}=${mockConnectedAddress}`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    expect(result.current.activeFilters).toContain(ENDORSED_FILTER_PARAM);
    expect(result.current.activeFilters).toContain(HAS_STATEMENT_FILTER_PARAM);
    expect(result.current.activeFilters).toContain(MY_DELEGATES_FILTER_PARAM);
  });

  it("should parse issues from URL", () => {
    const searchParams = `?${ISSUES_FILTER_PARAM}=issue1,issue2`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    expect(result.current.issuesFromUrl).toEqual(["issue1", "issue2"]);
  });

  it("should parse stakeholders from URL", () => {
    const searchParams = `?${STAKEHOLDERS_FILTER_PARAM}=stakeholder1,stakeholder2`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    expect(result.current.stakeholdersFromUrl).toEqual([
      "stakeholder1",
      "stakeholder2",
    ]);
  });

  it("should toggle filter when toggleFilterToUrl is called with 'all'", async () => {
    const searchParams = `?${ENDORSED_FILTER_PARAM}=true&${MY_DELEGATES_FILTER_PARAM}=${mockConnectedAddress}&${HAS_STATEMENT_FILTER_PARAM}=true`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    await act(async () => {
      await result.current.toggleFilterToUrl("all");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);

    // After toggling 'all', the active filters should be empty
    expect(result.current.activeFilters).toEqual([]);
  });

  it("should remove a filter when toggleFilterToUrl is called with an active filter", async () => {
    const searchParams = `?${ENDORSED_FILTER_PARAM}=true`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    expect(result.current.activeFilters).toContain(ENDORSED_FILTER_PARAM);

    await act(async () => {
      await result.current.toggleFilterToUrl(ENDORSED_FILTER_PARAM);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(result.current.activeFilters).not.toContain(ENDORSED_FILTER_PARAM);
  });

  it("should add a filter when toggleFilterToUrl is called with an inactive filter", async () => {
    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    await act(async () => {
      await result.current.toggleFilterToUrl(HAS_STATEMENT_FILTER_PARAM);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(result.current.activeFilters).toContain(HAS_STATEMENT_FILTER_PARAM);
  });

  it("should add MY_DELEGATES_FILTER_PARAM with connected wallet address", async () => {
    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    await act(async () => {
      await result.current.toggleFilterToUrl(MY_DELEGATES_FILTER_PARAM);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(result.current.activeFilters).toContain(MY_DELEGATES_FILTER_PARAM);
  });

  it("should reset all filters when resetAllFiltersToUrl is called", async () => {
    const searchParams = `?${ENDORSED_FILTER_PARAM}=true&${HAS_STATEMENT_FILTER_PARAM}=true&${ISSUES_FILTER_PARAM}=issue1&${STAKEHOLDERS_FILTER_PARAM}=stakeholder1&${MY_DELEGATES_FILTER_PARAM}=${mockConnectedAddress}`;

    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams }),
    });

    await act(async () => {
      await result.current.resetAllFiltersToUrl();
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(result.current.activeFilters).toEqual([]);
    expect(result.current.issuesFromUrl).toEqual([]);
    expect(result.current.stakeholdersFromUrl).toEqual([]);
  });

  it("should apply multiple filters when applyFiltersToUrl is called", async () => {
    const { result } = renderHook(() => useDelegatesFilter(), {
      wrapper: withNuqsTestingAdapter({ searchParams: "" }),
    });

    const filters = {
      [MY_DELEGATES_FILTER_PARAM]: mockConnectedAddress.toLowerCase(),
      [ENDORSED_FILTER_PARAM]: "true",
      [ISSUES_FILTER_PARAM]: "issue1,issue2",
    };

    await act(async () => {
      await result.current.applyFiltersToUrl(filters);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(result.current.activeFilters).toContain(MY_DELEGATES_FILTER_PARAM);
    expect(result.current.activeFilters).toContain(ENDORSED_FILTER_PARAM);
    expect(result.current.issuesFromUrl).toEqual(["issue1", "issue2"]);
  });
});
