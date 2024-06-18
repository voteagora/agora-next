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

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

// TODO: Better rendering for users with no voting power
export function CastVoteDialog(props: CastVoteDialogProps) {
  const { contracts } = Tenant.current();
  return contracts?.alligator ? (
    <AdvancedVoteDialog {...props} />
  ) : (
    <BasicVoteDialog {...props} />
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
        <VStack gap={4} className={styles.dialog_container}>
          <HStack justifyContent="justify-between">
            <VStack>
              {delegate.address ? (
                <div className={styles.subtitle}>
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className={styles.subtitle}>Anonymous</div>
              )}
              <div className={styles.title}>
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className={styles.subtitle}>with</div>
              <TokenAmountDisplay amount={vpToDisplay} />
            </VStack>
          </HStack>
          <div className={styles.reason_box}>
            {reason ? (
              <div className={styles.has_reason}>{reason}</div>
            ) : (
              <div className={styles.no_reason}>No voting reason provided</div>
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
        </VStack>
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
                <div className="text-xs text-theme-700 font-medium">
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className="text-xs text-theme-700 font-medium">
                  Anonymous
                </div>
              )}
              <div className="text-lg text-theme-900 font-extrabold">
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className="text-xs text-theme-700 font-medium">with</div>
              <TokenAmountDisplay amount={vpToDisplay} />
            </VStack>
          </HStack>
          <div>
            {reason ? (
              <div className="max-h-[40vh] overflow-y-scroll text-theme-700">
                {reason}
              </div>
            ) : (
              <div className="w-full py-6 px-4 rounded-lg border border-dashed border-theme-100 text-theme-700">
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
  isLoading?: boolean;
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
    standardTxHash: string | undefined;
    advancedTxHash: string | undefined;
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
      <div className="mb-5 text-sm text-theme-700">
        It might take up to a minute for the changes to be reflected. Thank you
        for participating in Optimism’s token house.
      </div>
      <div>
        <div
          onClick={closeDialog}
          className="text-center bg-white rounded-md border border-theme-100 font-medium shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-theme-100 active:shadow-none disabled:bg-gray-300 disabled:text-gray-700"
        >
          Got it
        </div>
      </div>
      <BlockScanUrls
        hash1={data?.standardTxHash}
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
      <div className="mb-5 text-sm text-theme-700">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-gray-eo rounded-lg`}
        >
          <div className="font-medium text-theme-700">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}

export function NoStatementView({ closeDialog }: { closeDialog: () => void }) {
  return (
    <div className="py-2 px-4 z-[1099] bg-theme-100 text-xs text-theme-700 rounded-lg">
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
      <div className="mb-5 text-sm text-theme-700">
        Thanks for trying to vote early! It looks like you’ve received votes via
        advanced delegation – a new beta feature. Voting will be enabled
        shortly. Please check back in a few days.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 border border-gray-eo rounded-lg cursor-pointer`}
          onClick={closeDialog}
        >
          <div className="font-medium">Got it, I’ll come back later</div>
        </div>
      </div>
    </VStack>
  );
}
