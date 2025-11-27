import { cleanup, render, screen } from "@testing-library/react";
import CastVoteContextProvider, { useCastVoteContext } from "./CastVoteContext";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEthBalance } from "@/hooks/useEthBalance";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";
import useStandardVoting from "@/hooks/useStandardVoting";
import React from "react";

vi.mock("next/font/google", async () => {
  const fonts = await import("@/__mocks__/fonts");
  return {
    Inter: fonts.Inter,
    Rajdhani: fonts.Rajdhani,
    Chivo_Mono: fonts.Chivo_Mono,
  };
});

vi.mock("server-only", () => ({
  default: {},
}));

vi.mock("@/lib/pinata", () => ({
  uploadFileToPinata: vi.fn(),
  getIPFSUrl: vi.fn(
    (hash: string) => `https://mock-gateway.cloud/ipfs/${hash}`
  ),
}));

vi.mock(import("react"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    cache: (fn: any) => fn,
  };
});

vi.mock("@/hooks/useEthBalance");
vi.mock("@/hooks/useSponsoredVoting");
vi.mock("@/hooks/useStandardVoting");
vi.mock("@/hooks/useAdvancedVoting");

vi.mock("wagmi", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAccount: () => ({
      address: "0xMockedAddress",
      isConnected: true,
    }),
    useConfig: () => ({}),
  };
});

vi.mock("@/lib/voteUtils", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    calculateVoteMetadataMinified: () => ({
      for: BigInt(0),
      against: BigInt(0),
      abstain: BigInt(0),
      quorum: BigInt(0),
      participation: 0,
      support: 0,
      supportRequired: 0,
      quorumRequired: BigInt(0),
      votingPower: BigInt(0),
    }),
  };
});

let mockVotingPower = {
  totalVP: "0",
  directVP: "0",
  advancedVP: "0",
};

const mockTenantConfig = {
  sponsoredVote: {
    enabled: true,
    config: {
      minVPToUseGasRelay: "10",
      minBalance: "0.1",
      sponsorAddress: "0x123",
    },
  },
};

vi.mock("@/lib/tenant/tenant", () => {
  class MockTenant {
    contracts = {
      token: {
        chain: {
          id: 1,
        },
      },
      governor: {
        provider: {},
      },
    };
    ui = {
      toggle: vi.fn((feature) => {
        if (feature === "sponsoredVote") {
          return mockTenantConfig.sponsoredVote;
        }
        return { enabled: false };
      }),
    };
  }

  return {
    default: {
      current: () => new MockTenant(),
    },
  };
});

const TestComponent = () => {
  const {
    fallbackToStandardVote,
    write,
    setFallbackToStandardVote,
    setReason,
  } = useCastVoteContext();

  React.useEffect(() => {
    (window as any).__setFallbackToStandardVote = setFallbackToStandardVote;
    (window as any).__setReason = setReason;
  }, [setFallbackToStandardVote, setReason]);

  return (
    <div>
      <div data-testid="canUseGasRelay">
        {/* If write is from sponsoredVoting, gas relay is live */}
        {String(!fallbackToStandardVote && write?.name === "sponsoredVoting")}
      </div>
    </div>
  );
};

describe("CastVoteContext - minVPToUseGasRelay", () => {
  const mockProposal = {
    id: "1",
    status: "ACTIVE",
  };

  const mockVotes: any[] = [];
  const mockChains = [["chain1"]];

  beforeEach(() => {
    vi.clearAllMocks();
    mockTenantConfig.sponsoredVote = {
      enabled: true,
      config: {
        minVPToUseGasRelay: "10",
        minBalance: "0.1",
        sponsorAddress: "0x123",
      },
    };
    mockVotingPower = {
      totalVP: "0",
      directVP: "0",
      advancedVP: "0",
    };
  });

  afterEach(() => {
    delete (window as any).__setFallbackToStandardVote;
    delete (window as any).__setReason;
    cleanup();
  });

  describe("Gas relay eligibility based on voting power", () => {
    it("should enable gas relay when voting power exceeds minimum requirement", () => {
      const mockVotingPower = {
        totalVP: "100",
        directVP: "100",
        advancedVP: "0",
      };

      vi.mocked(useEthBalance).mockReturnValue({
        data: BigInt("200000000000000000"),
      } as any);

      vi.mocked(useSponsoredVoting).mockReturnValue({
        write: {
          name: "sponsoredVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("true");
    });

    it("should disable gas relay when voting power is below minimum requirement", () => {
      const mockVotingPower = {
        totalVP: "5",
        directVP: "5",
        advancedVP: "0",
      };

      vi.mocked(useEthBalance).mockReturnValue({
        data: BigInt("200000000000000000"),
      } as any);

      vi.mocked(useStandardVoting).mockReturnValue({
        write: {
          name: "standardVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("false");
    });

    it("should disable gas relay when feature is disabled in tenant config", () => {
      mockTenantConfig.sponsoredVote.enabled = false;

      vi.mocked(useStandardVoting).mockReturnValue({
        write: {
          name: "standardVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("false");
    });

    it("should disable gas relay when sponsor balance is below minimum", () => {
      const mockVotingPower = {
        totalVP: "100",
        directVP: "100",
        advancedVP: "0",
      };

      vi.mocked(useEthBalance).mockReturnValue({
        data: BigInt("0"),
      } as any);

      vi.mocked(useStandardVoting).mockReturnValue({
        write: {
          name: "standardVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("false");
    });

    it("should disable gas relay when reason is provided", () => {
      vi.mocked(useEthBalance).mockReturnValue({
        data: BigInt("200000000000000000"),
      } as any);

      vi.mocked(useStandardVoting).mockReturnValue({
        write: {
          name: "standardVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      (window as any).__setReason("Test reason");

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("false");
    });

    it("should disable gas relay when fallbackToStandardVote is true", () => {
      vi.mocked(useEthBalance).mockReturnValue({
        data: BigInt("200000000000000000"),
      } as any);

      vi.mocked(useStandardVoting).mockReturnValue({
        write: {
          name: "standardVoting",
          write: () => {},
        },
      } as any);

      render(
        <CastVoteContextProvider
          proposal={mockProposal as any}
          votes={mockVotes}
          chains={mockChains}
          votingPower={mockVotingPower}
        >
          <TestComponent />
        </CastVoteContextProvider>
      );

      (window as any).__setFallbackToStandardVote(true);

      expect(screen.getByTestId("canUseGasRelay").textContent).toBe("false");
    });
  });
});
