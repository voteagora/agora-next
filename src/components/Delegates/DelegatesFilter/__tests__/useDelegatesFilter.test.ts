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

// Mock Tenant
const mockTenant = {
  ui: {
    governanceIssues: [] as any[],
    governanceStakeholders: [] as any[],
    toggle: vi.fn(),
  },
};

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

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => mockTenant,
  },
}));

describe("useDelegatesFilter", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    mockRouter.push.mockImplementation(() => {});
    mockSearchParams.get.mockImplementation(() => null);
    mockAddSearchParam.mockImplementation(
      (params) => `add-${params.name}-${params.value}`
    );
    mockDeleteSearchParam.mockImplementation((params) => {
      if (params.name) {
        return `delete-${params.name}`;
      }
      if (params.names) {
        return `delete-multiple-${params.names.join(",")}`;
      }
      return "";
    });

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
    const { result } = renderHook(() => useDelegatesFilter());

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

    const { result } = renderHook(() => useDelegatesFilter());

    expect(result.current.hasIssues).toBe(true);
    expect(result.current.hasStakeholders).toBe(true);
  });

  it("should detect endorsed filter from tenant config", () => {
    mockTenant.ui.toggle.mockReturnValue({
      enabled: true,
      config: { label: "Endorsed" },
    });

    const { result } = renderHook(() => useDelegatesFilter());

    expect(result.current.hasEndorsedFilter).toBe(true);
    expect(result.current.endorsedToggleConfig).toEqual({ label: "Endorsed" });
  });

  it("should set active filters based on URL params", () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === ENDORSED_FILTER_PARAM) return "true";
      if (param === HAS_STATEMENT_FILTER_PARAM) return "true";
      return null;
    });

    const { result } = renderHook(() => useDelegatesFilter());

    // Run the effect
    act(() => {});

    expect(result.current.activeFilters).toContain(ENDORSED_FILTER_PARAM);
    expect(result.current.activeFilters).toContain(HAS_STATEMENT_FILTER_PARAM);
    expect(result.current.activeFilters).not.toContain(
      MY_DELEGATES_FILTER_PARAM
    );
  });

  it("should parse issues from URL", () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === ISSUES_FILTER_PARAM) return "issue1,issue2";
      return null;
    });

    const { result } = renderHook(() => useDelegatesFilter());

    expect(result.current.issuesFromUrl).toEqual(["issue1", "issue2"]);
  });

  it("should parse stakeholders from URL", () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === STAKEHOLDERS_FILTER_PARAM)
        return "stakeholder1,stakeholder2";
      return null;
    });

    const { result } = renderHook(() => useDelegatesFilter());

    expect(result.current.stakeholdersFromUrl).toEqual([
      "stakeholder1",
      "stakeholder2",
    ]);
  });

  it("should remove delegate filters when toggleFilter is called with 'all'", () => {
    mockDeleteSearchParam.mockReturnValue(
      "delete-multiple-endorsed,myDelegates"
    );

    const { result } = renderHook(() => useDelegatesFilter());

    act(() => {
      result.current.toggleFilter("all");
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({
      names: [ENDORSED_FILTER_PARAM, MY_DELEGATES_FILTER_PARAM],
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      "delete-multiple-endorsed,myDelegates",
      { scroll: false }
    );
  });

  it("should remove a filter when toggleFilter is called with an active filter", () => {
    // Setup active filter
    mockSearchParams.get.mockImplementation((param) => {
      if (param === ENDORSED_FILTER_PARAM) return "true";
      return null;
    });

    mockDeleteSearchParam.mockReturnValue("delete-endorsed");

    const { result } = renderHook(() => useDelegatesFilter());

    // Run the effect to update activeFilters
    act(() => {});

    act(() => {
      result.current.toggleFilter(ENDORSED_FILTER_PARAM);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({
      name: ENDORSED_FILTER_PARAM,
    });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-endorsed", {
      scroll: false,
    });
  });

  it("should add a filter when toggleFilter is called with an inactive filter", () => {
    mockAddSearchParam.mockReturnValue("add-hasStatement-true");

    const { result } = renderHook(() => useDelegatesFilter());

    act(() => {
      result.current.toggleFilter(HAS_STATEMENT_FILTER_PARAM);
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockAddSearchParam).toHaveBeenCalledWith({
      name: HAS_STATEMENT_FILTER_PARAM,
      value: "true",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("add-hasStatement-true", {
      scroll: false,
    });
  });

  it("should reset all filters when resetFilters is called", () => {
    mockDeleteSearchParam.mockReturnValue("delete-all-filters");

    const { result } = renderHook(() => useDelegatesFilter());

    act(() => {
      result.current.resetFilters();
    });

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({
      names: [
        ENDORSED_FILTER_PARAM,
        HAS_STATEMENT_FILTER_PARAM,
        ISSUES_FILTER_PARAM,
        STAKEHOLDERS_FILTER_PARAM,
        MY_DELEGATES_FILTER_PARAM,
      ],
    });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-all-filters", {
      scroll: false,
    });
  });
});
