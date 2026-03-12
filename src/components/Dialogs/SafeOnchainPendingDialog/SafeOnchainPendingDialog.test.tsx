import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SafeOnchainPendingDialog } from "./SafeOnchainPendingDialog";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    useQueryMock.mockReturnValue({
      data: undefined,
      isFetching: false,
    });
  });

  it("renders Safe approval guidance and the queue link", () => {
    render(
      <SafeOnchainPendingDialog
        closeDialog={vi.fn()}
        safeAddress={"0x1234567890123456789012345678901234567890"}
        chainId={1}
      />
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

  it("uses the fast discovery poll interval during the first 15 seconds", () => {
    vi.spyOn(Date, "now").mockReturnValue(100_000);

    render(
      <SafeOnchainPendingDialog
        closeDialog={vi.fn()}
        safeAddress={"0x1234567890123456789012345678901234567890"}
        chainId={1}
        expectedTo={"0x9999999999999999999999999999999999999999"}
        expectedData={"0xdeadbeef"}
        createdAfter={95_000}
      />
    );

    const queryOptions = useQueryMock.mock.calls[0][0] as {
      refetchInterval: (query: {
        state: { data?: { found?: boolean } };
      }) => false | number;
      refetchIntervalInBackground: boolean;
      refetchOnWindowFocus: boolean;
    };

    expect(
      queryOptions.refetchInterval({ state: { data: { found: false } } })
    ).toBe(3_000);
    expect(
      queryOptions.refetchInterval({ state: { data: { found: true } } })
    ).toBe(false);
    expect(queryOptions.refetchIntervalInBackground).toBe(false);
    expect(queryOptions.refetchOnWindowFocus).toBe(false);
  });

  it("backs off discovery polling after 15 seconds and again after 60 seconds", () => {
    vi.spyOn(Date, "now").mockReturnValue(100_000);

    render(
      <SafeOnchainPendingDialog
        closeDialog={vi.fn()}
        safeAddress={"0x1234567890123456789012345678901234567890"}
        chainId={1}
        expectedTo={"0x9999999999999999999999999999999999999999"}
        expectedData={"0xdeadbeef"}
        createdAfter={80_000}
      />
    );

    const mediumQueryOptions = useQueryMock.mock.calls[0][0] as {
      refetchInterval: (query: {
        state: { data?: { found?: boolean } };
      }) => false | number;
    };

    expect(
      mediumQueryOptions.refetchInterval({
        state: { data: { found: false } },
      })
    ).toBe(5_000);

    vi.spyOn(Date, "now").mockReturnValue(200_000);

    render(
      <SafeOnchainPendingDialog
        closeDialog={vi.fn()}
        safeAddress={"0x1234567890123456789012345678901234567890"}
        chainId={1}
        expectedTo={"0x9999999999999999999999999999999999999999"}
        expectedData={"0xdeadbeef"}
        createdAfter={120_000}
      />
    );

    const slowQueryOptions = useQueryMock.mock.calls[1][0] as {
      refetchInterval: (query: {
        state: { data?: { found?: boolean } };
      }) => false | number;
      refetchIntervalInBackground: boolean;
    };

    expect(
      slowQueryOptions.refetchInterval({ state: { data: { found: false } } })
    ).toBe(8_000);
    expect(slowQueryOptions.refetchIntervalInBackground).toBe(false);
  });
});
