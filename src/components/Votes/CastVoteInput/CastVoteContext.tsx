import { Proposal } from "@/app/api/common/proposals/proposal";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";
import useStandardVoting from "@/hooks/useStandardVoting";
import Tenant from "@/lib/tenant/tenant";
import { MissingVote } from "@/lib/voteUtils";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  SetStateAction,
} from "react";

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
  data: {},
});

export function useCastVoteContext() {
  return useContext(CastVoteContext);
}

const CastVoteContextProvider = ({
  proposal,
  missingVote,
  chains,
  votingPower,
  children,
}: {
  proposal: Proposal;
  missingVote: MissingVote;
  chains: string[][];
  votingPower: VotingPowerData;
  children: React.ReactNode;
}) => {
  const [reason, setReason] = useState<string | null>(null);
  const [support, setSupport] = useState<
    SupportTextProps["supportType"] | null
  >(null);

  const { ui, contracts } = Tenant.current();

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

  const { write, isLoading, isSuccess, data } = (() => {
    if (ui.toggle("sponsoredVote")) {
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
        support,
        setSupport,
        write,
        isLoading,
        isSuccess,
        data,
      }}
    >
      {children}
    </CastVoteContext.Provider>
  );
};

export default CastVoteContextProvider;
