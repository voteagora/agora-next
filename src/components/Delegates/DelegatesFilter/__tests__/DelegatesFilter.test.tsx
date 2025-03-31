import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DelegatesFilter } from "../DelegatesFilter";
import { useDelegatesFilter } from "../useDelegatesFilter";
import {
  ENDORSED_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
} from "@/lib/constants";
import { useAccount } from "wagmi";

const mockConnectedAddress = "0x1234567890abcdef1234567890abcdef12345678";

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("../useDelegatesFilter");

vi.mock("../DelegatesIssuesFilter", () => ({
  default: () => <div data-testid="delegates-issues-filter">Issues Filter</div>,
}));

vi.mock("../DelegatesStakeholdersFilter", () => ({
  default: () => (
    <div data-testid="delegates-stakeholders-filter">Stakeholders Filter</div>
  ),
}));

vi.mock("@/components/common/FilterResetListbox", () => ({
  default: ({
    children,
    triggerLabel,
    triggerIcon,
    onReset,
    onOpenChange,
    isOpen,
    activeCount,
  }: any) => (
    <div data-testid="filter-reset-listbox" data-active-count={activeCount}>
      <button
        data-testid="trigger-button"
        onClick={() => onOpenChange(!isOpen)}
      >
        {triggerLabel}
        {triggerIcon && <div data-testid="filter-icon">{triggerIcon}</div>}
      </button>
      {isOpen && <div data-testid="dropdown-content">{children}</div>}
      <button data-testid="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

vi.mock("@/icons/filter", () => ({
  FilterIcon: ({ className }: any) => (
    <div data-testid="filter-icon-svg" className={className}>
      FilterIcon
    </div>
  ),
}));

vi.mock("@/icons/CheckMark", () => ({
  CheckMark: ({ className }: any) => (
    <div data-testid="check-mark" className={className}>
      CheckMark
    </div>
  ),
}));

// Mock wagmi's useAccount hook
vi.mock("wagmi");

describe("DelegatesFilter", () => {
  // Default mock values
  const defaultMockValues = {
    activeFilters: [],
    hasIssues: true,
    hasStakeholders: true,
    issuesFromUrl: [],
    stakeholdersFromUrl: [],
    hasEndorsedFilter: true,
    endorsedToggleConfig: {
      showFilterLabel: "Endorsed",
    },
    toggleFilterToUrl: vi.fn(),
    resetAllFiltersToUrl: vi.fn(),
    applyFiltersToUrl: vi.fn(),
    addFilterToUrl: vi.fn(),
    removeFilterToUrl: vi.fn(),
  };

  beforeEach(() => {
    // Setup default mock implementation
    (useDelegatesFilter as any).mockReturnValue(defaultMockValues);

    // Setup default useAccount mock
    vi.mocked(useAccount).mockReturnValue({
      address: mockConnectedAddress,
      isConnected: true,
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should render with default state", () => {
    render(<DelegatesFilter />);

    expect(screen.getByTestId("filter-reset-listbox")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-button")).toHaveTextContent("Filter");
    expect(screen.getByTestId("filter-icon")).toBeInTheDocument();

    // Dropdown should be closed by default
    expect(screen.queryByTestId("dropdown-content")).not.toBeInTheDocument();
  });

  it("should open dropdown when trigger button is clicked", () => {
    render(<DelegatesFilter />);

    // Click the trigger button to open dropdown
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Dropdown should be open
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
  });

  it("should render filter buttons correctly", () => {
    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check filter buttons
    expect(screen.getByText("All Delegates")).toBeInTheDocument();
    expect(screen.getByText("My Delegate(s)")).toBeInTheDocument();
    expect(screen.getByText("Endorsed")).toBeInTheDocument();
    expect(screen.getByText("Has statement")).toBeInTheDocument();
  });

  it("should not render 'My Delegate(s)' button when no address is connected", () => {
    // Mock useAccount to return no address - need to clear previous mocks first
    vi.mocked(useAccount).mockClear();
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any);

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check that 'My Delegate(s)' button is not rendered
    expect(screen.queryByText("My Delegate(s)")).not.toBeInTheDocument();
  });

  it("should render 'My Delegate(s)' button when user is connected", () => {
    // Mock useAccount to return a connected address
    vi.mocked(useAccount).mockReturnValueOnce({
      address: mockConnectedAddress,
      isConnected: true,
    } as any);

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check that 'My Delegate(s)' button is rendered
    expect(screen.getByText("My Delegate(s)")).toBeInTheDocument();
  });

  it("should call toggleFilterToUrl with correct parameter when filter button is clicked", () => {
    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Click "My Delegates" filter
    fireEvent.click(screen.getByText("My Delegate(s)"));

    // Check if toggleFilterToUrl was called with correct parameter
    expect(defaultMockValues.toggleFilterToUrl).toHaveBeenCalledWith(
      MY_DELEGATES_FILTER_PARAM
    );
  });

  it("should call toggleFilterToUrl with 'all' when 'All Delegates' button is clicked", () => {
    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Click "All Delegates" filter
    fireEvent.click(screen.getByText("All Delegates"));

    // Check if toggleFilterToUrl was called with 'all'
    expect(defaultMockValues.toggleFilterToUrl).toHaveBeenCalledWith("all");
  });

  it("should call resetAllFiltersToUrl when reset button is clicked", () => {
    render(<DelegatesFilter />);

    // Click reset button
    fireEvent.click(screen.getByTestId("reset-button"));

    // Check if resetAllFiltersToUrl was called
    expect(defaultMockValues.resetAllFiltersToUrl).toHaveBeenCalled();
  });

  it("should render active filters with correct styling", () => {
    // Mock active filters
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      activeFilters: [MY_DELEGATES_FILTER_PARAM, ENDORSED_FILTER_PARAM],
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Get filter buttons
    const allDelegatesButton = screen
      .getByText("All Delegates")
      .closest("button");
    const myDelegatesButton = screen
      .getByText("My Delegate(s)")
      .closest("button");
    const endorsedButton = screen.getByText("Endorsed").closest("button");

    // Check active state styling
    expect(allDelegatesButton).toHaveClass("bg-neutral");
    expect(myDelegatesButton).toHaveClass("bg-brandPrimary");
    expect(endorsedButton).toHaveClass("bg-brandPrimary");
  });

  it("should display the correct active filter count", () => {
    // Mock active filters and URL params
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      activeFilters: [MY_DELEGATES_FILTER_PARAM, ENDORSED_FILTER_PARAM],
      issuesFromUrl: ["issue1", "issue2"],
      stakeholdersFromUrl: ["stakeholder1"],
    });

    render(<DelegatesFilter />);

    // Check active count (2 active filters + 2 issues + 1 stakeholder = 5)
    expect(screen.getByTestId("filter-reset-listbox")).toHaveAttribute(
      "data-active-count",
      "5"
    );
  });

  it("should render issues filter when hasIssues is true", () => {
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      hasIssues: true,
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check if issues filter is rendered
    expect(screen.getByTestId("delegates-issues-filter")).toBeInTheDocument();
  });

  it("should not render issues filter when hasIssues is false", () => {
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      hasIssues: false,
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check if issues filter is not rendered
    expect(
      screen.queryByTestId("delegates-issues-filter")
    ).not.toBeInTheDocument();
  });

  it("should render stakeholders filter when hasStakeholders is true", () => {
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      hasStakeholders: true,
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check if stakeholders filter is rendered
    expect(
      screen.getByTestId("delegates-stakeholders-filter")
    ).toBeInTheDocument();
  });

  it("should not render stakeholders filter when hasStakeholders is false", () => {
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      hasStakeholders: false,
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check if stakeholders filter is not rendered
    expect(
      screen.queryByTestId("delegates-stakeholders-filter")
    ).not.toBeInTheDocument();
  });

  it("should not render endorsed filter when hasEndorsedFilter is false", () => {
    (useDelegatesFilter as any).mockReturnValue({
      ...defaultMockValues,
      hasEndorsedFilter: false,
    });

    render(<DelegatesFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check if endorsed filter is not rendered
    expect(screen.queryByText("Endorsed")).not.toBeInTheDocument();
  });
});
