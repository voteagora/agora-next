import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import styles from "./proposal.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import OPApprovalProposalStatus from "./OPApprovalProposalStatus";
import ProposalTimeStatus from "./ProposalTimeStatus";
import { cn, getProposalTypeText } from "@/lib/utils";
import OPOptimisticProposalStatus from "./OPOptimisticProposalStatus";
import SnapshotProposalStatus from "./SnapshotProposalStatus";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import Tenant from "@/lib/tenant/tenant";
import HumanAddress from "@/components/shared/HumanAddress";
import VoteText from "@/components/Votes/VoteText/VoteText";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function Proposal({
  proposal,
  votableSupply,
  fetchUserVotesForProposal,
}) {
  const proposalText = getProposalTypeText(proposal.proposalType);
  const { address } = useAccount();
  const [userVotes, setUserVotes] = useState([]);

  const fetchUserVoteAndSet = useCallback(
    async (proposal_id, address) => {
      try {
        let fetchedUserVotes = await fetchUserVotesForProposal(
          proposal_id,
          address
        );
        setUserVotes(fetchedUserVotes);
      } catch (error) {
        console.log(error, "error");
      }
    },
    [fetchUserVotesForProposal]
  );

  useEffect(() => {
    if (address && proposal.id && fetchUserVotesForProposal !== undefined) {
      fetchUserVoteAndSet(proposal.id, address);
    }
  }, [address, fetchUserVoteAndSet, fetchUserVotesForProposal, proposal.id]);

  return (
    <Link
      href={
        proposal.proposalType === "SNAPSHOT"
          ? proposal.proposalData.link
          : `/proposals/${proposal.id}`
      }
      target={proposal.proposalType === "SNAPSHOT" ? "_blank" : ""}
    >
      <HStack alignItems="center" className={styles.proposal_row}>
        <VStack className={cn(styles.cell_content, styles.cell_title)}>
          {proposal.proposalType === "SNAPSHOT" ? (
            <HStack className={styles.cell_content_title} gap={1}>
              <p>Snapshot Proposal</p>
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mt-1" />
            </HStack>
          ) : (
            <HStack className={styles.cell_content_title} gap={1}>
              {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
              <div>
                {proposalText}{" "}
                <span className={styles.invisible_on_mobile}>
                  {Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM ? (
                    "by The Optimism Foundation"
                  ) : (
                    <>
                      by <HumanAddress address={proposal.proposer} />{" "}
                    </>
                  )}
                </span>
              </div>
              <div className={styles.mobile_status}>
                <ProposalStatus proposal={proposal} />
              </div>
            </HStack>
          )}
          <div
            className={`${styles.cell_content_body} ${styles.proposal_title} overflow-visible whitespace-normal break-words flex gap-3`}
          >
            {proposal.markdowntitle.length > 80
              ? `${proposal.markdowntitle.slice(0, 80)}...`
              : proposal.markdowntitle}

            {userVotes[0]?.support && (
              <div
                className={`w-fit flex gap-1 items-center font-code rounded-sm !bg-opacity-10 py-[2px] px-1 text-xs font-medium ${styles["vote_" + userVotes[0]?.support.toLowerCase()]}`}
              >
                You <VoteText support={userVotes[0]?.support} />
              </div>
            )}
          </div>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_status)}>
          <VStack alignItems="flex-end">
            <div className={styles.cell_content_title}>
              <ProposalTimeStatus
                proposalStatus={proposal.status}
                proposalStartTime={proposal.start_time}
                proposalEndTime={proposal.end_time}
                proposalCancelledTime={proposal.cancelled_time}
              />
            </div>
            <ProposalStatus proposal={proposal} />
          </VStack>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_result)}>
          <div className={styles.cell_content_body}>
            {proposal.proposalType === "SNAPSHOT" && (
              <SnapshotProposalStatus proposal={proposal} />
            )}
            {proposal.proposalType === "STANDARD" &&
              proposal.proposalResults && (
                <OPStandardProposalStatus proposal={proposal} />
              )}
            {proposal.proposalType === "OPTIMISTIC" &&
              proposal.proposalResults && (
                <OPOptimisticProposalStatus
                  proposal={proposal}
                  votableSupply={votableSupply}
                />
              )}
            {proposal.proposalType === "APPROVAL" && proposal.proposalData && (
              <OPApprovalProposalStatus proposal={proposal} />
            )}
          </div>
        </VStack>
      </HStack>
    </Link>
  );
}
