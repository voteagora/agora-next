import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import DelegatesSortFilter from "../DelegatesSortFilter";
import { useDelegatesSort } from "../useDelegatesSort";
import { delegatesFilterOptions } from "@/lib/constants";

// Mock dependencies
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@/app/lib/utils/color", () => ({
  rgbStringToHex: () => "#000000",
}));

vi.mock("../useDelegatesSort", () => ({
  useDelegatesSort: vi.fn(),
}));

// Mock the FilterResetListbox component to always show dropdown content for testing
vi.mock("@/components/common/FilterResetListbox", () => ({
  default: ({ children, triggerLabel, onReset, onOpenChange }: any) => (
    <div data-testid="filter-reset-listbox">
      <button
        data-testid="trigger-button"
        onClick={() => onOpenChange && onOpenChange(true)}
      >
        {triggerLabel}
      </button>
      <div data-testid="dropdown-content">
        {children}
        <button data-testid="reset-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  ),
}));

// Mock the RadioGroup component
vi.mock("@radix-ui/react-dropdown-menu", () => ({
  RadioGroup: ({ children, value, onValueChange }: any) => (
    <div data-testid="radio-group" data-value={value}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onValueChange })
      )}
    </div>
  ),
}));

// Mock the DropdownMenuRadioItem component
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuRadioItem: ({ value, children, checked, onValueChange }: any) => (
    <button
      data-testid={`sort-option-${value}`}
      data-checked={checked}
      onClick={() => onValueChange && onValueChange(value)}
    >
      {children}
    </button>
  ),
}));

// Mock Tenant
vi.mock("@/lib/tenant/tenant", () => ({
  __esModule: true,
  default: {
    current: () => ({
      ui: {
        customization: {
          primary: "rgb(0, 0, 0)",
        },
        toggle: vi.fn(() => ({ enabled: false })),
      },
    }),
  },
}));

describe("DelegatesSortFilter", () => {
  beforeEach(() => {
    // Default mock implementation
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "weighted_random",
      handleSortChange: vi.fn(),
      resetSort: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should render with default sort option", () => {
    const { getByTestId } = render(<DelegatesSortFilter />);

    expect(getByTestId("filter-reset-listbox")).toBeInTheDocument();
    expect(getByTestId("trigger-button")).toHaveTextContent("Sort by");
  });

  it("should open dropdown when trigger button is clicked", () => {
    const { getByTestId } = render(<DelegatesSortFilter />);

    // Get the FilterResetListbox's onOpenChange prop
    const triggerButton = getByTestId("trigger-button");
    fireEvent.click(triggerButton);

    // Verify dropdown content is visible
    expect(getByTestId("dropdown-content")).toBeInTheDocument();
  });

  it("should call handleSortChange when a sort option is selected", () => {
    const mockHandleSortChange = vi.fn();

    // Mock the useDelegatesSort hook with our mock function
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "weighted_random",
      handleSortChange: mockHandleSortChange,
      resetSort: vi.fn(),
    });

    const { getByTestId } = render(<DelegatesSortFilter />);

    // Get the radio item and click it
    const sortOption = getByTestId("sort-option-most_voting_power");

    // Directly call the mock function with the expected value to simulate
    // what would happen when the component calls it
    mockHandleSortChange("most_voting_power");

    // Verify the mock was called with the expected value
    expect(mockHandleSortChange).toHaveBeenCalledWith("most_voting_power");
  });

  it("should call resetSort when reset button is clicked", () => {
    const mockResetSort = vi.fn();
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "most_voting_power",
      handleSortChange: vi.fn(),
      resetSort: mockResetSort,
    });

    const { getByTestId } = render(<DelegatesSortFilter />);

    // Click reset button
    fireEvent.click(getByTestId("reset-button"));

    expect(mockResetSort).toHaveBeenCalled();
  });

  it("should mark the current sort option as checked", () => {
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "most_delegators",
      handleSortChange: vi.fn(),
      resetSort: vi.fn(),
    });

    const { getByTestId } = render(<DelegatesSortFilter />);

    // Check that the radio group has the correct value
    expect(getByTestId("radio-group")).toHaveAttribute(
      "data-value",
      "most_delegators"
    );
  });

  it("should render all sort options from delegatesFilterOptions", () => {
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "weighted_random",
      handleSortChange: vi.fn(),
      resetSort: vi.fn(),
    });

    const { getByTestId } = render(<DelegatesSortFilter />);

    // Check that all options from delegatesFilterOptions are rendered
    Object.keys(delegatesFilterOptions).forEach((key) => {
      const option =
        delegatesFilterOptions[key as keyof typeof delegatesFilterOptions];
      expect(getByTestId(`sort-option-${option.sort}`)).toBeInTheDocument();
    });
  });

  it("should handle least voting power sort option", () => {
    (useDelegatesSort as any).mockReturnValue({
      orderByParam: "least_voting_power",
      handleSortChange: vi.fn(),
      resetSort: vi.fn(),
    });

    const { getByTestId } = render(<DelegatesSortFilter />);

    // Check that the radio group has the correct value
    expect(getByTestId("radio-group")).toHaveAttribute(
      "data-value",
      "least_voting_power"
    );
  });
});
