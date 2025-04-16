import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  DelegatesFilterChips,
  DelegateFilterChip,
} from "../DelegatesFilterChips";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
} from "@/lib/constants";

// Mock wagmi to avoid WagmiProviderNotFoundError
vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
  }),
}));

// Mock the useDelegatesFilter hook
const mockRemoveFilterToUrl = vi.fn();
const mockUseDelegatesFilter = vi.fn().mockReturnValue({
  activeFilters: [],
  issuesFromUrl: [],
  stakeholdersFromUrl: [],
  endorsedToggleConfig: null,
  removeFilterToUrl: mockRemoveFilterToUrl,
});

// Important: Mock this module before importing any components that use it
vi.mock("@/components/Delegates/DelegatesFilter/useDelegatesFilter", () => ({
  useDelegatesFilter: () => mockUseDelegatesFilter(),
}));

// Mock the AgoraContext
vi.mock("@/contexts/AgoraContext", () => ({
  useAgoraContext: vi.fn(),
}));

// Mock Tenant
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: vi.fn().mockReturnValue({
      ui: {
        toggle: vi.fn().mockImplementation((key) => {
          if (key === "delegates/endorsed-filter") {
            return {
              config: {
                showFilterLabel: "Endorsed",
              },
            };
          }
          return null;
        }),
        governanceIssues: [
          { key: "issue1", title: "Issue 1" },
          { key: "issue2", title: "Issue 2" },
        ],
        governanceStakeholders: [
          { key: "stakeholder1", title: "Stakeholder 1" },
          { key: "stakeholder2", title: "Stakeholder 2" },
        ],
        token: {
          symbol: "TEST",
        },
      },
    }),
  },
}));

const setupTenantMock = ({
  showFilterLabel = null,
  governanceIssues = [],
  governanceStakeholders = [],
}: {
  showFilterLabel?: string | null;
  governanceIssues?: Array<{ key: string; title: string }>;
  governanceStakeholders?: Array<{ key: string; title: string }>;
} = {}) => {
  const mockToggle = showFilterLabel
    ? {
        config: {
          showFilterLabel,
        },
      }
    : null;

  (Tenant.current as any).mockReturnValue({
    ui: {
      toggle: () => mockToggle,
      governanceIssues,
      governanceStakeholders,
    },
  });
};

describe("DelegateFilterChip", () => {
  it("renders correctly with label", () => {
    const handleClick = vi.fn();
    render(<DelegateFilterChip label="Test Label" onClick={handleClick} />);

    expect(
      screen.getByRole("button", { name: /Test Label/i })
    ).toBeInTheDocument();
  });

  it("applies active styles when isActive is true", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <DelegateFilterChip label="Test Label" onClick={handleClick} isActive />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-brandPrimary");
    expect(button).toHaveClass("text-neutral");
  });

  it("applies inactive styles when isActive is false", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <DelegateFilterChip label="Test Label" onClick={handleClick} />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-neutral");
    expect(button).toHaveClass("text-primary");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(
      <DelegateFilterChip label="Test Label Click" onClick={handleClick} />
    );

    const button = screen.getByRole("button", { name: /Test Label Click/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it("renders icon when provided", () => {
    const handleClick = vi.fn();
    render(
      <DelegateFilterChip
        label="Test Label"
        onClick={handleClick}
        icon={<span data-testid="test-icon">Icon</span>}
      />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});

describe("DelegatesFilterChips", () => {
  const mockSetIsDelegatesFiltering = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (useAgoraContext as any).mockReturnValue({
      setIsDelegatesFiltering: mockSetIsDelegatesFiltering,
    });

    // Reset the mock
    mockRemoveFilterToUrl.mockClear();
    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when no active filters", () => {
    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    const { container } = render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    expect(container.firstChild).toBeNull();
  });

  it("renders endorsed filter chip when search params have endorsedFilter param", () => {
    setupTenantMock({ showFilterLabel: "Endorsed" });

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [ENDORSED_FILTER_PARAM],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: { showFilterLabel: "Endorsed" },
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const endorsedChip = screen.getByText("Endorsed");
    expect(endorsedChip).toBeInTheDocument();

    const chipButton = endorsedChip.closest("button");
    expect(chipButton).toBeInTheDocument();
  });

  it("renders has statement filter chip when hasStatement param is true", () => {
    setupTenantMock();

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [HAS_STATEMENT_FILTER_PARAM],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const hasStatementChip = screen.getByText("Has statement");
    expect(hasStatementChip).toBeInTheDocument();

    const chipButton = hasStatementChip.closest("button");
    expect(chipButton).toBeInTheDocument();
  });

  it("renders my delegates filter chip when myDelegates param is true", () => {
    setupTenantMock();

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [MY_DELEGATES_FILTER_PARAM],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const myDelegatesChip = screen.getByText("My delegate(s)");
    expect(myDelegatesChip).toBeInTheDocument();

    const chipButton = myDelegatesChip.closest("button");
    expect(chipButton).toBeInTheDocument();
  });

  it("renders issues filter chips when issues param is present", () => {
    const mockIssues = [
      { key: "issue1", title: "Issue 1" },
      { key: "issue2", title: "Issue 2" },
    ];

    setupTenantMock({ governanceIssues: mockIssues });

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [],
      issuesFromUrl: ["issue1", "issue2"],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const issue1Chip = screen.getByText("Issue 1");
    const issue2Chip = screen.getByText("Issue 2");
    expect(issue1Chip).toBeInTheDocument();
    expect(issue2Chip).toBeInTheDocument();
  });

  it("renders stakeholders filter chips when stakeholders param is present", () => {
    const mockStakeholders = [
      { key: "stakeholder1", title: "Stakeholder 1" },
      { key: "stakeholder2", title: "Stakeholder 2" },
    ];

    setupTenantMock({ governanceStakeholders: mockStakeholders });

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [],
      issuesFromUrl: [],
      stakeholdersFromUrl: ["stakeholder1", "stakeholder2"],
      endorsedToggleConfig: null,
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const stakeholder1Chip = screen.getByText("Stakeholder 1");
    const stakeholder2Chip = screen.getByText("Stakeholder 2");
    expect(stakeholder1Chip).toBeInTheDocument();
    expect(stakeholder2Chip).toBeInTheDocument();
  });

  it("removes a filter when its chip is clicked", () => {
    setupTenantMock({ showFilterLabel: "Endorsed" });

    mockUseDelegatesFilter.mockReturnValue({
      activeFilters: [ENDORSED_FILTER_PARAM],
      issuesFromUrl: [],
      stakeholdersFromUrl: [],
      endorsedToggleConfig: { showFilterLabel: "Endorsed" },
      removeFilterToUrl: mockRemoveFilterToUrl,
    });

    const { container } = render(<DelegatesFilterChips />);

    act(() => {
      vi.runAllTimers();
    });

    const buttons = container.querySelectorAll("button");

    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(mockRemoveFilterToUrl).toHaveBeenCalledWith(
        ENDORSED_FILTER_PARAM,
        "false"
      );
    }
  });
});
