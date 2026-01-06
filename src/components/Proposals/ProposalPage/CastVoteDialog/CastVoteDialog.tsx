"use client";

import { ReactNode, useEffect, useState } from "react";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import Image from "next/image";
import Link from "next/link";
import useAdvancedVoting from "../../../../hooks/useAdvancedVoting";
import { CastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { Button } from "@/components/ui/button";
import { getVpToDisplay } from "@/lib/voteUtils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import useStandardVoting from "@/hooks/useStandardVoting";
import Tenant from "@/lib/tenant/tenant";
import { useScwVoting } from "@/hooks/useScwVoting";
import ENSName from "@/components/shared/ENSName";

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

export function CastVoteDialog(props: CastVoteDialogProps) {
  const { contracts } = Tenant.current();

  return contracts?.alligator ? (
    <AdvancedVoteDialog {...props} />
  ) : (
    <BasicVoteDialog {...props} />
  );
}

/**
 * Voting from the SCW wallet works but is not yet supported in the UI
 * Note that the voting power is derived from the scw wallet and not EOA
 */
const SCWVoteDialog = ({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  missingVote,
}: CastVoteDialogProps) => {
  const { write, isLoading, isSuccess, data } = useScwVoting({
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
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              {delegate.address ? (
                <div className="text-xs text-tertiary font-medium">
                  <ENSName address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-tertiary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </div>
            <div className="flex flex-col items-end text-primary">
              <div className="text-xs text-tertiary font-medium">with</div>
              <TokenAmountDecorated amount={vpToDisplay} />
            </div>
          </div>
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
            <VoteButton onClick={write}>
              Vote {supportType.toLowerCase()} with{"\u00A0"}
              <TokenAmountDecorated amount={vpToDisplay} />
            </VoteButton>
          </div>
        </div>
      )}
      {isSuccess && <SuccessMessage closeDialog={closeDialog} data={data} />}
    </>
  );
};

const BasicVoteDialog = ({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  missingVote,
}: CastVoteDialogProps) => {
  const { write, isLoading, isSuccess, data } = useStandardVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (!delegate) {
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
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              {delegate.address ? (
                <div className="text-xs text-tertiary font-medium">
                  <ENSName address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-tertiary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </div>
            <div className="flex flex-col items-end text-primary">
              <div className="text-xs text-tertiary font-medium">with</div>
              <TokenAmountDecorated amount={vpToDisplay} />
            </div>
          </div>
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
                <TokenAmountDecorated amount={vpToDisplay} />
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
};

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
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              {delegate.address ? (
                <div className="text-xs text-tertiary font-medium">
                  <ENSName address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-tertiary font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-primary font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </div>
            <div className="flex flex-col items-end text-primary">
              <div className="text-xs text-tertiary font-medium">with</div>
              <TokenAmountDecorated amount={vpToDisplay} />
            </div>
          </div>
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
                <TokenAmountDecorated amount={vpToDisplay} />
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
    <Button
      onClick={onClick}
      className="w-full bg-brandPrimary hover:bg-brandPrimary/90 text-neutral"
    >
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
  };
}) {
  const { ui } = Tenant.current();

  return (
    <div className="flex flex-col w-full">
      <Image
        width="457"
        height="155"
        src={ui.assets.success}
        className="w-full mb-3"
        alt="agora loading"
      />
      <div className="mb-2 text-2xl font-black text-primary">
        Your vote has been submitted!
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected. Thank you
        for your active participation in governance.
      </div>
      <div>
        <div
          onClick={() => {
            // temporary solution rather than actually changing UI state
            window.location.reload();
            closeDialog();
          }}
          className="text-center bg-neutral rounded-md border border-line font-medium shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-wash active:shadow-none disabled:bg-line text-secondary"
        >
          Got it
        </div>
      </div>
      <BlockScanUrls
        hash1={data?.standardTxHash}
        hash2={data?.advancedTxHash}
      />
    </div>
  );
}

export function LoadingVote() {
  const { ui } = Tenant.current();

  return (
    <div className="flex flex-col w-full">
      <Image
        src={ui.assets.pending}
        className="w-full mb-3"
        alt="Vote pending"
      />
      <div className="mb-2 text-2xl font-black text-primary">
        Casting your vote
      </div>
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
    </div>
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
    <div className="flex flex-col w-full">
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
    </div>
  );
}
