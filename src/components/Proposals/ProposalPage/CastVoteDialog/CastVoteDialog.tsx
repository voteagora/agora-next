"use client";

import { ReactNode } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import Image from "next/image";
import Link from "next/link";
import useAdvancedVoting from "../../../../hooks/useAdvancedVoting";
import { CastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { Button } from "@/components/ui/button";
import { getVpToDisplay } from "@/lib/voteUtils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import useStandardVoting from "@/hooks/useStandardVoting";
import Tenant from "@/lib/tenant/tenant";
import useSponsoredVoting from "@/hooks/useSponsoredVoting";

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

// TODO: Better rendering for users with no voting power
export function CastVoteDialog(props: CastVoteDialogProps) {
  const { contracts, ui } = Tenant.current();
  const sponsoredVoteToggle = ui.toggle("sponsoredVote");

  if (sponsoredVoteToggle) {
    return <SponsoredVoteDialog {...props} />;
  }

  return contracts?.alligator ? (
    <AdvancedVoteDialog {...props} />
  ) : (
    <BasicVoteDialog {...props} />
  );
}

function SponsoredVoteDialog({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  missingVote,
}: CastVoteDialogProps) {
  const { ui } = Tenant.current();

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

  if (!delegate) {
    // todo: log
    return null;
  }

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <>
      {!isSuccess && (
        <div
          className="flex flex-col gap-4 w-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <HStack justifyContent="justify-between">
            <VStack>
              {delegate.address ? (
                <div className="text-xs text-tertiary font-medium">
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-tertiary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className="text-xs text-tertiary font-medium">with</div>
              <TokenAmountDisplay amount={vpToDisplay} />
            </VStack>
          </HStack>
          <div>
            {reason ? (
              <div className="max-h-[40vh] overflow-y-scroll text-secondary">
                {reason}
              </div>
            ) : (
              <div className="w-full py-6 px-4 rounded-lg border border-line text-center text-secondary">
                No voting reason provided
              </div>
            )}
          </div>
          <div>
            {delegate.statement ? (
              <VoteButton onClick={write}>
                {!isSignatureSuccess ? (
                  <>
                    Sign vote {supportType.toLowerCase()} with{"\u00A0"}
                    <TokenAmountDisplay amount={vpToDisplay} />
                  </>
                ) : (
                  <>
                    Vote {supportType.toLowerCase()} with{"\u00A0"}
                    <TokenAmountDisplay amount={vpToDisplay} />
                  </>
                )}
              </VoteButton>
            ) : (
              <NoStatementView closeDialog={closeDialog} />
            )}
          </div>
        </div>
      )}
      {isSuccess && <SuccessMessage closeDialog={closeDialog} data={data} />}
    </>
  );
}

function BasicVoteDialog({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  missingVote,
}: CastVoteDialogProps) {
  const { write, isLoading, isSuccess, data } = useStandardVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (!delegate) {
    // todo: log
    return null;
  }

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <>
      {!isSuccess && (
        <div
          className="flex flex-col gap-4 w-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <HStack justifyContent="justify-between">
            <VStack>
              {delegate.address ? (
                <div className="text-xs text-tertiary font-medium">
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-tertiary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className="text-xs text-tertiary font-medium">with</div>
              <TokenAmountDisplay amount={vpToDisplay} />
            </VStack>
          </HStack>
          <div>
            {reason ? (
              <div className="max-h-[40vh] overflow-y-scroll text-secondary">
                {reason}
              </div>
            ) : (
              <div className="w-full py-6 px-4 rounded-lg border border-line text-center text-secondary">
                No voting reason provided
              </div>
            )}
          </div>
          <div>
            {delegate.statement ? (
              <VoteButton onClick={write}>
                Vote {supportType.toLowerCase()} with{"\u00A0"}
                <TokenAmountDisplay amount={vpToDisplay} />
              </VoteButton>
            ) : (
              <NoStatementView closeDialog={closeDialog} />
            )}
          </div>
        </div>
      )}
      {isSuccess && <SuccessMessage closeDialog={closeDialog} data={data} />}
    </>
  );
}

function AdvancedVoteDialog({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  authorityChains,
  missingVote,
}: CastVoteDialogProps) {
  const { write, isLoading, isSuccess, data } = useAdvancedVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains,
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (!delegate) {
    // todo: log
    return null;
  }

  if (isLoading) {
    return <LoadingVote />;
  }

  return (
    <>
      {!isSuccess && (
        <div
          className="w-full relative gap-4"
          style={{ transformStyle: "preserve-3d" }}
        >
          <HStack justifyContent="justify-between">
            <VStack>
              {delegate.address ? (
                <div className="text-xs text-secondary font-medium">
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-secondary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className="text-xs text-secondary font-medium">with</div>
              <TokenAmountDisplay amount={vpToDisplay} />
            </VStack>
          </HStack>
          <div>
            {reason ? (
              <div className="max-h-[40vh] overflow-y-scroll text-secondary">
                {reason}
              </div>
            ) : (
              <div className="w-full py-6 px-4 rounded-lg border border-dashed border-line text-secondary">
                No voting reason provided
              </div>
            )}
          </div>
          <div>
            {delegate.statement ? (
              <VoteButton onClick={write}>
                Vote {supportType.toLowerCase()} with{"\u00A0"}
                <TokenAmountDisplay amount={vpToDisplay} />
              </VoteButton>
            ) : (
              <NoStatementView closeDialog={closeDialog} />
            )}
          </div>
        </div>
      )}
      {isSuccess && <SuccessMessage closeDialog={closeDialog} data={data} />}
    </>
  );
}

const VoteButton = ({
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

export function SuccessMessage({
  closeDialog,
  data,
}: {
  closeDialog: () => void;
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
        <div
          onClick={closeDialog}
          className="text-center bg-neutral rounded-md border border-line font-medium shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary"
        >
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

export function LoadingVote() {
  const { ui } = Tenant.current();

  return (
    <VStack className="w-full">
      <Image
        src={ui.assets.pending}
        className="w-full mb-3"
        alt="Vote pending"
      />
      <div className="mb-2 text-2xl font-black">Casting your vote</div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-line rounded-lg`}
        >
          <div className="font-medium text-secondary">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}

export function NoStatementView({ closeDialog }: { closeDialog: () => void }) {
  return (
    <div className="py-2 px-4 z-[1099] bg-line text-xs text-secondary rounded-lg">
      You do not have a delegate statement.{" "}
      <Link
        href={"/delegates/create"}
        className="underline"
        onClick={closeDialog}
      >
        Please set one up to vote.
      </Link>
    </div>
  );
}

export function DisabledVoteDialog({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  const { ui } = Tenant.current();

  return (
    <VStack className="w-full">
      <Image
        width="457"
        height="155"
        src={ui.assets.pending}
        className="w-full mb-3"
        alt="agora loading"
      />
      <div className="mb-2 text-2xl font-black">
        Voting will be available soon!
      </div>
      <div className="mb-5 text-sm text-secondary">
        Thanks for trying to vote early! It looks like you’ve received votes via
        advanced delegation – a new beta feature. Voting will be enabled
        shortly. Please check back in a few days.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 border border-line rounded-lg cursor-pointer`}
          onClick={closeDialog}
        >
          <div className="font-medium">Got it, I’ll come back later</div>
        </div>
      </div>
    </VStack>
  );
}
