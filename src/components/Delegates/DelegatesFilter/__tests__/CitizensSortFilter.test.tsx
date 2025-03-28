import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CitizensSortFilter from "../CitizensSortFilter";
import { citizensFilterOptions } from "@/lib/constants";

// Mock dependencies
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

// Fix: Define the tenant mock directly in the mock function
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        customization: {
          primary: "rgb(0, 0, 255)",
        },
      },
    }),
  },
}));

vi.mock("@/app/lib/utils/color", () => ({
  rgbStringToHex: vi.fn().mockReturnValue("#0000ff"),
}));

// Mock FilterResetListbox component
vi.mock("@/components/common/FilterResetListbox", () => ({
  default: ({ children, triggerLabel, onReset, onOpenChange, isOpen }: any) => (
    <div data-testid="filter-reset-listbox">
      <button
        data-testid="trigger-button"
        onClick={() => onOpenChange(!isOpen)}
      >
        {triggerLabel}
      </button>
      {isOpen && <div data-testid="dropdown-content">{children}</div>}
      <button data-testid="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

// Mock DropdownMenu components
vi.mock("@radix-ui/react-dropdown-menu", () => ({
  RadioGroup: ({ children, onValueChange, value }: any) => (
    <div data-testid="radio-group" data-value={value}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              onClick={() => onValueChange(child.props.value)}
              data-testid={`radio-option-${child.props.value}`}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuRadioItem: ({ children, value, checked }: any) => (
    <div data-testid={`menu-item-${value}`} data-checked={checked}>
      {children}
    </div>
  ),
}));

describe("CitizensSortFilter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRouter.push.mockImplementation(() => {});
    mockSearchParams.get.mockImplementation(() => null);
    mockAddSearchParam.mockImplementation(
      (params) => `add-${params.name}-${params.value}`
    );
    mockDeleteSearchParam.mockImplementation(
      (params) => `delete-${params.name}`
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("should render with default sort option", () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<CitizensSortFilter />);

    expect(screen.getByTestId("filter-reset-listbox")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-button")).toHaveTextContent("Sort by");
  });

  it("should use 'shuffle' as the default sort option when no search param exists", () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<CitizensSortFilter />);

    // Open the dropdown
    fireEvent.click(screen.getByTestId("trigger-button"));

    // The radio group should have the default value
    expect(screen.getByTestId("radio-group")).toHaveAttribute(
      "data-value",
      "shuffle"
    );
  });

  it("should use the sort option from search params when it exists", () => {
    mockSearchParams.get.mockReturnValue("votes");

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // The radio group should have the value from search params
    expect(screen.getByTestId("radio-group")).toHaveAttribute(
      "data-value",
      "votes"
    );
  });

  it("should call setIsDelegatesFiltering and router.push with addSearchParam when a non-default sort option is selected", () => {
    mockSearchParams.get.mockReturnValue(null);
    const nonDefaultOption = Object.keys(citizensFilterOptions).find(
      (key) =>
        citizensFilterOptions[key as keyof typeof citizensFilterOptions]
          .sort !== "shuffle"
    );

    const optionValue = nonDefaultOption
      ? citizensFilterOptions[
          nonDefaultOption as keyof typeof citizensFilterOptions
        ].sort
      : "most_voting_power";

    mockAddSearchParam.mockReturnValue(`add-citizensOrderBy-${optionValue}`);

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Select a non-default option
    fireEvent.click(screen.getByTestId(`radio-option-${optionValue}`));

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockAddSearchParam).toHaveBeenCalledWith({
      name: "citizensOrderBy",
      value: optionValue,
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      `add-citizensOrderBy-${optionValue}`,
      { scroll: false }
    );
  });

  it("should call setIsDelegatesFiltering and router.push with deleteSearchParam when the default sort option is selected", () => {
    mockSearchParams.get.mockReturnValue("votes");
    mockDeleteSearchParam.mockReturnValue("delete-citizensOrderBy");

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Select the default option
    fireEvent.click(screen.getByTestId("radio-option-shuffle"));

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({
      name: "citizensOrderBy",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-citizensOrderBy", {
      scroll: false,
    });
  });

  it("should call setIsDelegatesFiltering and router.push with deleteSearchParam when reset is clicked", () => {
    mockSearchParams.get.mockReturnValue("votes");
    mockDeleteSearchParam.mockReturnValue("delete-citizensOrderBy");

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("reset-button"));

    expect(mockSetIsDelegatesFiltering).toHaveBeenCalledWith(true);
    expect(mockDeleteSearchParam).toHaveBeenCalledWith({
      name: "citizensOrderBy",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("delete-citizensOrderBy", {
      scroll: false,
    });
  });

  it("should render all sort options from citizensFilterOptions", () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Check that all options from citizensFilterOptions are rendered
    Object.keys(citizensFilterOptions).forEach((key) => {
      const option =
        citizensFilterOptions[key as keyof typeof citizensFilterOptions];
      expect(
        screen.getByTestId(`radio-option-${option.sort}`)
      ).toBeInTheDocument();
    });
  });

  it("should close the dropdown after selecting an option", () => {
    mockSearchParams.get.mockReturnValue(null);
    const nonDefaultOption = Object.keys(citizensFilterOptions).find(
      (key) =>
        citizensFilterOptions[key as keyof typeof citizensFilterOptions]
          .sort !== "shuffle"
    );

    const optionValue = nonDefaultOption
      ? citizensFilterOptions[
          nonDefaultOption as keyof typeof citizensFilterOptions
        ].sort
      : "most_voting_power";

    render(<CitizensSortFilter />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Dropdown content should be visible
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();

    // Select an option
    fireEvent.click(screen.getByTestId(`radio-option-${optionValue}`));

    // Dropdown content should no longer be visible
    expect(screen.queryByTestId("dropdown-content")).not.toBeInTheDocument();
  });
});
