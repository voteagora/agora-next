import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { SafeOnchainPendingDialog } from "./SafeOnchainPendingDialog";

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({ children, href, fullWidth: _fullWidth, ...props }: any) =>
    href ? (
      <a href={href} {...props}>
        {children}
      </a>
    ) : (
      <button {...props}>{children}</button>
    ),
}));

describe("SafeOnchainPendingDialog", () => {
  it("renders Safe approval guidance and the queue link", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SafeOnchainPendingDialog
          closeDialog={vi.fn()}
          safeAddress={"0x1234567890123456789012345678901234567890"}
          chainId={1}
        />
      </QueryClientProvider>
    );

    expect(
      screen.getByText("Open Safe and confirm transaction")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Waiting for the first Safe confirmation in the Safe app."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Safe/i })).toHaveAttribute(
      "href",
      "https://app.safe.global/home?safe=eth:0x1234567890123456789012345678901234567890"
    );
  });
});
