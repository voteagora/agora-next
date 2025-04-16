import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(" "),
}));

// Mock the dropdown menu component
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuRadioItem: (props: any) => (
    <div
      data-testid="dropdown-radio-item"
      data-value={props.value}
      data-checked={props.checked}
      className={props.className}
    >
      {props.children}
    </div>
  ),
}));

// Import after mocks to ensure mocks are applied
import { SortOption, MobileSortOption } from "../FilterSortOption";

// Clean up after each test
afterEach(() => {
  cleanup();
});

describe("SortOption", () => {
  it("renders with correct props when checked", () => {
    const { getByTestId } = render(
      <SortOption
        label="Most Voting Power"
        value="most_voting_power"
        checked={true}
      />
    );

    const radioItem = getByTestId("dropdown-radio-item");
    expect(radioItem.getAttribute("data-value")).toBe("most_voting_power");
    expect(radioItem.getAttribute("data-checked")).toBe("true");
    expect(radioItem.className.includes("text-primary")).toBe(true);
    expect(radioItem.textContent).toBe("Most Voting Power");
  });

  it("renders with correct props when not checked", () => {
    const { getByTestId } = render(
      <SortOption
        label="Most Voting Power"
        value="most_voting_power"
        checked={false}
      />
    );

    const radioItem = getByTestId("dropdown-radio-item");
    expect(radioItem.getAttribute("data-value")).toBe("most_voting_power");
    expect(radioItem.getAttribute("data-checked")).toBe("false");
    expect(radioItem.className.includes("text-secondary")).toBe(true);
  });
});

describe("MobileSortOption", () => {
  it("renders correctly when checked", () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <MobileSortOption
        label="Most Voting Power"
        checked={true}
        onClick={handleClick}
      />
    );

    const button = getByRole("button");
    expect(button.textContent?.includes("Most Voting Power")).toBe(true);
    expect(button.className.includes("text-primary")).toBe(true);

    // Check that the inner dot is rendered when checked
    const innerDot = button.querySelector("div > div");
    expect(innerDot).not.toBe(null);
  });

  it("renders correctly when not checked", () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <MobileSortOption
        label="Most Voting Power"
        checked={false}
        onClick={handleClick}
      />
    );

    // Check that the unchecked styling is applied
    const button = getByRole("button");
    expect(button.className.includes("text-secondary")).toBe(true);

    // Check that the inner dot is not rendered when unchecked
    const outerCircle = button.querySelector("div");
    expect(outerCircle?.className.includes("border-line")).toBe(true);
    expect(outerCircle?.childElementCount).toBe(0);
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <MobileSortOption
        label="Most Voting Power"
        checked={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
