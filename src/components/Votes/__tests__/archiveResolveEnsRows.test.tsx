import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SnapshotVote, Vote } from "@/app/api/common/votes/vote";
import ApprovalProposalSingleVote from "../ApprovalProposalVotesList/ApprovalProposalSingleVote";
import CopelandProposalSingleVote from "../CopelandProposalVotesList/CopelandProposalSingleVote";

const mocks = vi.hoisted(() => ({
  useEnsName: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined }),
  useEnsName: mocks.useEnsName,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      token: { decimals: 18, symbol: "OP" },
      ui: {
        assets: { delegate: "/delegate.png" },
        customization: { tokenAmountFont: "" },
      },
    }),
  },
}));

vi.mock("@/styles/fonts", () => ({
  fontMapper: {},
}));

vi.mock("@/lib/utils", () => ({
  capitalizeFirstLetter: (value: string) => value,
  formatNumber: (value: string) => value,
  getBlockScanUrl: () => "#",
  timeout: () => Promise.resolve(),
}));

vi.mock("@/app/lib/utils/text", () => ({
  truncateAddress: (address: string) => `truncated:${address}`,
}));

vi.mock("@/components/Layout/Stack", () => ({
  HStack: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/shared/TokenAmountDecorated", () => ({
  default: ({ amount }: { amount: string }) => (
    <span data-testid="token-amount">{amount}</span>
  ),
}));

vi.mock("@/components/shared/ENSAvatar", () => ({
  default: () => <span data-testid="ens-avatar" />,
}));

vi.mock("@/components/shared/ENSName", () => ({
  default: () => <span data-testid="ens-name">ens-name</span>,
}));

vi.mock("@/components/shared/AvatarImage", () => ({
  default: ({ src }: { src?: string | null }) => (
    <span data-testid="avatar">{src || "fallback-avatar"}</span>
  ),
}));

vi.mock("@/components/shared/Markdown/Markdown", () => ({
  default: ({ content }: { content: string }) => <span>{content}</span>,
}));

vi.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

const voterAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function makeApprovalVote(overrides: Partial<Vote> = {}): Vote {
  return {
    transactionHash: null,
    address: voterAddress,
    proposalId: "1",
    support: "FOR",
    weight: "1",
    reason: null,
    params: ["Choice A"],
    proposalValue: 0n,
    proposalTitle: "Proposal",
    proposalType: "APPROVAL",
    timestamp: null,
    blockNumber: undefined,
    citizenType: null,
    voterMetadata: null,
    ...overrides,
  };
}

function makeCopelandVote(overrides: Partial<SnapshotVote> = {}): SnapshotVote {
  return {
    id: "vote-1",
    address: voterAddress,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    choice: "",
    votingPower: 1,
    title: "Proposal",
    reason: "",
    choiceLabels: ["Choice A"],
    voterMetadata: null,
    ...overrides,
  };
}

describe("archive vote rows with visible-row ENS resolution", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.useEnsName.mockReset();
    mocks.useEnsName.mockReturnValue({ data: "resolved.eth" });
  });

  it("uses approval archive metadata without resolving ENS", () => {
    render(
      <ApprovalProposalSingleVote
        vote={makeApprovalVote({
          voterMetadata: {
            name: "Archive Alice",
            image: "ipfs://alice",
            type: "",
          },
        })}
      />
    );

    expect(screen.getByText("Archive Alice")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toHaveTextContent("ipfs://alice");
    expect(screen.queryByTestId("ens-name")).not.toBeInTheDocument();
    expect(mocks.useEnsName).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { enabled: false },
      })
    );
  });

  it("resolves approval ENS names for visible rows without metadata", () => {
    render(<ApprovalProposalSingleVote vote={makeApprovalVote()} />);

    expect(screen.getByText("resolved.eth")).toBeInTheDocument();
    expect(screen.getByTestId("ens-avatar")).toBeInTheDocument();
    expect(mocks.useEnsName).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { enabled: true },
      })
    );
  });

  it("resolves Copeland ENS names for visible rows without metadata", () => {
    render(<CopelandProposalSingleVote vote={makeCopelandVote()} />);

    expect(screen.getByTestId("ens-name")).toBeInTheDocument();
    expect(screen.getByTestId("ens-avatar")).toBeInTheDocument();
    expect(
      screen.queryByText(`truncated:${voterAddress}`)
    ).not.toBeInTheDocument();
  });
});
