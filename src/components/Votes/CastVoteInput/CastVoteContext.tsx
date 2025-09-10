import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";
import useStandardVoting from "@/hooks/useStandardVoting";
import Tenant from "@/lib/tenant/tenant";
import {
  calculateVoteMetadataMinified,
  checkMissingVoteForDelegate,
} from "@/lib/voteUtils";
import {
  createContext,
  type Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useEthBalance } from "@/hooks/useEthBalance";
import { formatEther } from "viem";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import useEffectEvent from "@/hooks/useEffectEvent";
import { useAccount } from "wagmi";

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
  error: any;
  reset: () => void;
  resetError: () => void;
  fallbackToStandardVote: boolean;
  setFallbackToStandardVote: Dispatch<SetStateAction<boolean>>;
  data: Partial<{
    standardTxHash: string | null;
    advancedTxHash: string | null;
    sponsoredVoteTxHash: string | null;
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
  error: null,
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
  votableSupply,
}: {
  proposal: Proposal;
  votes: Vote[] | null;
  chains: string[][] | null;
  votingPower: VotingPowerData | null;
  children: React.ReactNode;
  votableSupply?: string;
}) => {
  const [reason, setReason] = useState<string | null>(null);
  const [support, setSupport] = useState<
    SupportTextProps["supportType"] | null
  >(null);
  const [fallbackToStandardVote, setFallbackToStandardVote] = useState(false);
  const [hasShownShareVote, setHasShownShareVote] = useState<boolean>(false);
  const openDialog = useOpenDialog();
  const { address } = useAccount();

  const { ui, contracts } = Tenant.current();

  const missingVote = checkMissingVoteForDelegate(
    votes ?? [],
    votingPower ?? {
      advancedVP: "0",
      directVP: "0",
      totalVP: "0",
    }
  );
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
    advancedVP: votingPower?.advancedVP ? BigInt(votingPower.advancedVP) : null,
    authorityChains: chains ?? null,
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
    Number(votingPower?.totalVP ?? "0") >
      Number(gasRelayConfig?.minVPToUseGasRelay) &&
    !reason &&
    !fallbackToStandardVote;

  const { write, isLoading, isSuccess, data, isError, resetError, error } =
    (() => {
      if (isGasRelayLive) {
        return sponsoredVotingValues;
      }
      if (contracts?.alligator) {
        return advancedVoteValues;
      }
      return standardVoteValues;
    })();

  const newVote = {
    support: support || "",
    reason: reason || "",
    params: [],
    weight: votingPower?.directVP || votingPower?.advancedVP || "0",
  };

  const { againstPercentage, forPercentage, endsIn } =
    calculateVoteMetadataMinified({
      proposal,
      votableSupply: votableSupply,
      newVote,
    });

  const shareVoteSessionKey = `agora--share-vote-shown:${proposal.id}`;

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(shareVoteSessionKey);
      setHasShownShareVote(stored === "1");
    } catch (_) {}
  }, [proposal.id, shareVoteSessionKey]);

  const openShareVoteDialog = useEffectEvent(() => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(shareVoteSessionKey, "1");
      }
    } catch (_) {}
    setHasShownShareVote(true);
    openDialog({
      className: "sm:w-[32rem]",
      type: "SHARE_VOTE",
      params: {
        againstPercentage,
        forPercentage,
        endsIn,
        blockNumber: null,
        voteDate: null,
        supportType: support || "ABSTAIN",
        voteReason: reason || "",
        proposalId: proposal.id,
        newVote: newVote,
        proposalTitle: proposal.markdowntitle,
        proposalType: proposal.proposalType ?? "STANDARD",
        proposal: proposal,
        options: [],
        totalOptions: 0,
        votes,
      },
    });
  });

  useEffect(() => {
    if (isSuccess && !hasShownShareVote) {
      openShareVoteDialog();
    }
  }, [isSuccess, hasShownShareVote, openShareVoteDialog]);

  return (
    <CastVoteContext.Provider
      value={{
        reason,
        setReason,
        support: missingVote === "NONE" ? votes?.[0]?.support : support,
        setSupport,
        write,
        isLoading,
        isSuccess,
        isError,
        error,
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
                standardTxHash: votes?.[0]?.transactionHash,
                advancedTxHash: votes?.[1]?.transactionHash,
              }
            : data,
      }}
    >
      {children}
    </CastVoteContext.Provider>
  );
};

export default CastVoteContextProvider;
