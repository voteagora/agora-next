import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";
import useStandardVoting from "@/hooks/useStandardVoting";
import Tenant from "@/lib/tenant/tenant";
import { checkMissingVoteForDelegate } from "@/lib/voteUtils";
import {
  createContext,
  type Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useEthBalance } from "@/hooks/useEthBalance";
import { formatEther } from "viem";

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

type CastVoteContextType = {
  reason: string | null;
  setReason: Dispatch<SetStateAction<string | null>>;
  support: SupportTextProps["supportType"] | null;
  setSupport: Dispatch<SetStateAction<SupportTextProps["supportType"] | null>>;
  write: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
  resetError: () => void;
  fallbackToStandardVote: boolean;
  setFallbackToStandardVote: Dispatch<SetStateAction<boolean>>;
  data: Partial<{
    standardTxHash: string;
    advancedTxHash: string;
    sponsoredVoteTxHash: string;
  }>;
};

const CastVoteContext = createContext<CastVoteContextType>({
  reason: null,
  setReason: (reason) => {},
  support: null,
  setSupport: (support) => {},
  write: () => {},
  isLoading: false,
  isSuccess: false,
  isError: false,
  reset: () => {},
  resetError: () => {},
  fallbackToStandardVote: false,
  setFallbackToStandardVote: (fallbackToStandardVote) => {},
  data: {},
});

export function useCastVoteContext() {
  return useContext(CastVoteContext);
}

const CastVoteContextProvider = ({
  proposal,
  votes,
  chains,
  votingPower,
  children,
}: {
  proposal: Proposal;
  votes: Vote[];
  chains: string[][];
  votingPower: VotingPowerData;
  children: React.ReactNode;
}) => {
  const [reason, setReason] = useState<string | null>(null);
  const [support, setSupport] = useState<
    SupportTextProps["supportType"] | null
  >(null);
  const [fallbackToStandardVote, setFallbackToStandardVote] = useState(false);

  const { ui, contracts } = Tenant.current();

  const missingVote = checkMissingVoteForDelegate(votes, votingPower);

  const sponsoredVotingValues = useSponsoredVoting({
    proposalId: proposal.id,
    support: support === "FOR" ? 1 : support === "AGAINST" ? 0 : 2,
  });

  const standardVoteValues = useStandardVoting({
    proposalId: proposal.id,
    support: support === "FOR" ? 1 : support === "AGAINST" ? 0 : 2,
    reason: reason || "",
    missingVote,
  });

  const advancedVoteValues = useAdvancedVoting({
    proposalId: proposal.id,
    support: support === "FOR" ? 1 : support === "AGAINST" ? 0 : 2,
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains: chains,
    reason: reason || "",
    missingVote,
  });

  const isGasRelayEnabled = ui.toggle("sponsoredVote")?.enabled === true;
  const gasRelayConfig = ui.toggle("sponsoredVote")?.config as UIGasRelayConfig;
  const { data: sponsorBalance } = useEthBalance({
    enabled: isGasRelayEnabled,
    address: gasRelayConfig?.sponsorAddress,
  });
  // Gas relay is only LIVE when it is enabled in the settings and the sponsor meets minimum eth requirements and the user has enough VP
  const isGasRelayLive =
    isGasRelayEnabled &&
    Number(formatEther(sponsorBalance || 0n)) >=
      Number(gasRelayConfig.minBalance) &&
    Number(votingPower.totalVP) > Number(gasRelayConfig?.minVPToUseGasRelay) &&
    !reason &&
    !fallbackToStandardVote;

  const { write, isLoading, isSuccess, data, isError, resetError } = (() => {
    if (isGasRelayLive) {
      return sponsoredVotingValues;
    }
    if (contracts?.alligator) {
      return advancedVoteValues;
    }
    return standardVoteValues;
  })();

  return (
    <CastVoteContext.Provider
      value={{
        reason,
        setReason,
        support: missingVote === "NONE" ? votes[0].support : support,
        setSupport,
        write,
        isLoading,
        isSuccess,
        isError,
        reset: () => {
          setFallbackToStandardVote(false);
          resetError();
        },
        resetError,
        fallbackToStandardVote,
        setFallbackToStandardVote,
        data:
          missingVote === "NONE"
            ? {
                standardTxHash: votes[0]?.transactionHash,
                advancedTxHash: votes[1]?.transactionHash,
              }
            : data,
      }}
    >
      {children}
    </CastVoteContext.Provider>
  );
};

export default CastVoteContextProvider;
