import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DelegateProfileImageWithMetadata } from "../DelegateProfileImage";
import { useEnsName } from "wagmi";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

vi.mock("server-only", () => ({}));

vi.mock("wagmi", () => ({
  useEnsName: vi.fn(),
  useEnsAvatar: vi.fn(() => ({ data: null })),
}));

vi.mock("@/hooks/useForum", () => ({
  useForumAdminsList: vi.fn(() => ({
    admins: [],
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/contexts/ConnectButtonContext", () => ({
  useConnectButtonContext: vi.fn(),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: () => ({
          enabled: true,
          config: {
            tooltip: "Endorsed Delegate",
          },
        }),
        assets: {
          delegate: "/path/to/default/delegate/image.png",
        },
      },
    }),
  },
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

describe("DelegateProfileImageWithMetadata", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const defaultProps = {
    address: mockAddress,
    endorsed: true,
    votingPower: "1000000000000000000",
    description: "Test description",
    location: "Test location",
    followersCount: "100",
    followingCount: "50",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnsName as any).mockReturnValue({ data: "test.eth" });
    (useConnectButtonContext as any).mockReturnValue({
      refetchDelegate: null,
      setRefetchDelegate: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders basic delegate information correctly", () => {
    render(<DelegateProfileImageWithMetadata {...defaultProps} />);

    expect(screen.getByText("Test location")).toBeInTheDocument();
    const descriptions = screen.getAllByText("Test description");
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it("renders followers and following count correctly", () => {
    render(<DelegateProfileImageWithMetadata {...defaultProps} />);

    const followingElements = screen.getAllByText(/following/i);
    const followersElements = screen.getAllByText(/followers/i);

    expect(followingElements.length).toBeGreaterThan(0);
    expect(followersElements.length).toBeGreaterThan(0);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders endorsed icon when endorsed prop is true", () => {
    render(<DelegateProfileImageWithMetadata {...defaultProps} />);

    const endorsedIcon = screen.getByAltText("Endorsed Delegate");
    expect(endorsedIcon).toBeInTheDocument();
  });

  it("does not render location when not provided", () => {
    const propsWithoutLocation = { ...defaultProps, location: undefined };
    render(<DelegateProfileImageWithMetadata {...propsWithoutLocation} />);

    expect(screen.queryByText("Test location")).not.toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const propsWithoutDescription = { ...defaultProps, description: undefined };
    render(<DelegateProfileImageWithMetadata {...propsWithoutDescription} />);

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("does not render followers/following when counts are not provided", () => {
    const propsWithoutCounts = {
      ...defaultProps,
      followersCount: undefined,
      followingCount: undefined,
    };
    render(<DelegateProfileImageWithMetadata {...propsWithoutCounts} />);

    expect(screen.queryByText(/following/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/followers/i)).not.toBeInTheDocument();
  });
});
