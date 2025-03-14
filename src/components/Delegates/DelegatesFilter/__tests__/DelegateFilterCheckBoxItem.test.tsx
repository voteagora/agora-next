import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DelegateFilterCheckBoxItem } from "../DelegateFilterCheckBoxItem";

// Mock the CheckIcon component
vi.mock("@heroicons/react/20/solid", () => ({
  CheckIcon: () => <div data-testid="check-icon">CheckIcon</div>,
}));

describe("DelegateFilterCheckBoxItem", () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("should render with label and unchecked state", () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <DelegateFilterCheckBoxItem
        label="Test Label"
        checked={false}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toHaveClass("text-secondary");

    // Verify checkbox is unchecked (no check icon)
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();

    // Verify border is present for unchecked state
    const uncheckedBox = container.querySelector(".border-positive");
    expect(uncheckedBox).toBeInTheDocument();
  });

  it("should render with label and checked state", () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <DelegateFilterCheckBoxItem
        label="Test Label"
        checked={true}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toHaveClass("text-primary");

    // Verify check icon is present
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();

    // Verify background color for checked state
    const checkedBox = container.querySelector(".bg-positive");
    expect(checkedBox).toBeInTheDocument();
  });

  it("should call onChange when checkbox is clicked", () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <DelegateFilterCheckBoxItem
        label="Test Label"
        checked={false}
        onChange={mockOnChange}
      />
    );

    // Click the checkbox
    const checkbox = container.querySelector(".cursor-pointer");
    fireEvent.click(checkbox!);

    // Verify onChange was called
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
