"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import { ReactNode, useState } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import {
  LoadingVote,
  SupportTextProps,
} from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { type VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import {
  MissingVote,
  checkMissingVoteForDelegate,
  getVpToDisplay,
} from "@/lib/voteUtils";
import useFetchAllForVoting from "@/hooks/useFetchAllForVoting";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";
import { TokenAmountDisplay } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import useStandardVoting from "@/hooks/useStandardVoting";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";

type Props = {
  proposal: Proposal;
  isOptimistic?: boolean;
};

export default function CastVoteInput({
  proposal,
  isOptimistic = false,
}: Props) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const [reason, setReason] = useState("");
  const [support, setSupport] = useState<
    SupportTextProps["supportType"] | null
  >(null);
  const { chains, delegate, isSuccess, votes, votingPower } =
    useFetchAllForVoting({
      proposal,
    });

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <Button variant={"outline"} onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (!isSuccess || !chains || !delegate || !votes || !votingPower) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <DisabledVoteButton reason="Loading..." />
      </div>
    );
  }

  return (
    <>
      <VStack className="bg-neutral border-t border-b border-line rounded-b-lg flex-shrink shadow-md">
        <textarea
          placeholder="I believe..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-sm resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 m-3"
        />
        <VStack
          justifyContent="justify-between"
          alignItems="items-stretch"
          className="px-3 pb-3 pt-1"
        >
          <VoteButtons
            onClick={(supportType: SupportTextProps["supportType"]) => {
              setSupport(supportType);
            }}
            proposalStatus={proposal.status}
            delegateVotes={votes}
            isOptimistic={isOptimistic}
            votingPower={votingPower}
            selectedSupport={support}
          />
          {support && (
            <VoteSubmitButton
              proposalId={proposal.id}
              supportType={support}
              votingPower={votingPower}
              missingVote={checkMissingVoteForDelegate(votes, votingPower)}
              reason={reason}
              chains={chains}
            />
          )}
        </VStack>
      </VStack>
      <div className="text-sm text-secondary mt-2 px-4">
        Voting on Agora is free!
      </div>
    </>
  );
}

function VoteSubmitButton({
  proposalId,
  supportType,
  votingPower,
  missingVote,
  reason,
  chains,
}: {
  proposalId: string;
  supportType: SupportTextProps["supportType"];
  votingPower: VotingPowerData;
  missingVote: MissingVote;
  reason: string;
  chains: string[][];
}) {
  const { contracts, ui } = Tenant.current();
  const sponsoredVoteToggle = ui.toggle("sponsoredVote");

  if (sponsoredVoteToggle && !reason) {
    return (
      <SponsoredVoteSubmitButton
        proposalId={proposalId}
        supportType={supportType}
        votingPower={votingPower}
        missingVote={missingVote}
      />
    );
  }

  return contracts?.alligator ? (
    <AdvancedVoteSubmitButton
      proposalId={proposalId}
      reason={reason}
      supportType={supportType}
      votingPower={votingPower}
      authorityChains={chains}
      missingVote={missingVote}
    />
  ) : (
    <StandardVoteSubmitButton
      proposalId={proposalId}
      supportType={supportType}
      votingPower={votingPower}
      missingVote={missingVote}
      reason={reason}
    />
  );
}

function StandardVoteSubmitButton({
  proposalId,
  supportType,
  votingPower,
  missingVote,
  reason,
}: {
  proposalId: string;
  supportType: SupportTextProps["supportType"];
  votingPower: VotingPowerData;
  missingVote: MissingVote;
  reason: string;
}) {
  const { write, isLoading, isSuccess, data } = useStandardVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <div className="pt-3">
      {!isSuccess && (
        <SubmitButton onClick={write}>
          <>
            Vote {supportType.toLowerCase()} with{"\u00A0"}
            <TokenAmountDisplay amount={vpToDisplay} />
          </>
        </SubmitButton>
      )}
      {isSuccess && <SuccessMessage data={data} />}
    </div>
  );
}

function AdvancedVoteSubmitButton({
  proposalId,
  reason,
  supportType,
  votingPower,
  authorityChains,
  missingVote,
}: {
  proposalId: string;
  reason: string;
  supportType: SupportTextProps["supportType"];
  votingPower: VotingPowerData;
  authorityChains: string[][];
  missingVote: MissingVote;
}) {
  const { write, isLoading, isSuccess, data } = useAdvancedVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains,
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <div className="pt-3">
      {!isSuccess && (
        <SubmitButton onClick={write}>
          <>
            Vote {supportType.toLowerCase()} with{"\u00A0"}
            <TokenAmountDisplay amount={vpToDisplay} />
          </>
        </SubmitButton>
      )}
      {isSuccess && <SuccessMessage data={data} />}
    </div>
  );
}

function SponsoredVoteSubmitButton({
  proposalId,
  supportType,
  votingPower,
  missingVote,
}: {
  proposalId: string;
  supportType: SupportTextProps["supportType"];
  votingPower: VotingPowerData;
  missingVote: MissingVote;
}) {
  const {
    write,
    isLoading,
    isSuccess,
    data,
    isSignatureSuccess,
    isWaitingForSignature,
  } = useSponsoredVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <div className="pt-3">
      {!isSuccess && (
        <SubmitButton onClick={write}>
          <>
            Sign & vote {supportType.toLowerCase()} with{"\u00A0"}
            <TokenAmountDisplay amount={vpToDisplay} />
          </>
        </SubmitButton>
      )}
      {isSuccess && <SuccessMessage data={data} />}
    </div>
  );
}

const SubmitButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Button onClick={onClick} className="w-full">
      {children}
    </Button>
  );
};

function SuccessMessage({
  data,
}: {
  data: {
    standardTxHash?: string;
    advancedTxHash?: string;
    sponsoredVoteTxHash?: string;
  };
}) {
  const { ui } = Tenant.current();

  return (
    <VStack className="w-full">
      <Image
        width="457"
        height="155"
        src={ui.assets.success}
        className="w-full mb-3"
        alt="agora loading"
      />
      <div className="mb-2 text-2xl font-black">
        Your vote has been submitted!
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected. Thank you
        for your active participation in governance.
      </div>
      <div>
        <div className="text-center bg-neutral rounded-md border border-line font-medium shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary">
          Got it
        </div>
      </div>
      <BlockScanUrls
        hash1={data?.sponsoredVoteTxHash || data?.standardTxHash}
        hash2={data?.advancedTxHash}
      />
    </VStack>
  );
}

function VoteButtons({
  onClick,
  proposalStatus,
  delegateVotes,
  isOptimistic,
  votingPower,
  selectedSupport,
}: {
  onClick: (supportType: SupportTextProps["supportType"]) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isOptimistic: boolean;
  votingPower: VotingPowerData;
  selectedSupport: SupportTextProps["supportType"] | null;
}) {
  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  const missingVote = checkMissingVoteForDelegate(delegateVotes, votingPower);

  if (missingVote === "NONE") {
    return <DisabledVoteButton reason="Already voted" />;
  }

  console.log("selectedSupport", selectedSupport);

  return (
    <HStack gap={2} className="pt-1">
      {(isOptimistic ? ["AGAINST"] : ["FOR", "AGAINST", "ABSTAIN"]).map(
        (supportType) => (
          <VoteButton
            key={supportType}
            action={supportType as SupportTextProps["supportType"]}
            onClick={() => {
              onClick(supportType as SupportTextProps["supportType"]);
            }}
            selected={selectedSupport === supportType}
          />
        )
      )}
    </HStack>
  );
}

function VoteButton({
  action,
  onClick,
  selected,
}: {
  action: SupportTextProps["supportType"];
  onClick: () => void;
  selected: boolean;
}) {
  const actionString = action.toLowerCase();

  return (
    <button
      className={`${actionString === "for" ? "text-positive" : actionString === "against" ? "text-negative" : "text-secondary"} ${selected ? "bg-positive" : "bg-neutral"} rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1`}
      onClick={onClick}
    >
      {action.toLowerCase()}
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button
      disabled
      className="bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1"
    >
      {reason}
    </button>
  );
}
