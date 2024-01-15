import Link from "next/link";
import styles from "./proposal.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import OPApprovalProposalStatus from "./OPApprovalProposalStatus";
import ProposalTimeStatus from "./ProposalTimeStatus";
import { cn, getProposalTypeText } from "@/lib/utils";
import OPOptimisticProposalStatus from "./OPOptimisticProposalStatus";

export default function Proposal({ proposal, votableSupply }) {
  const proposalText = getProposalTypeText(proposal.proposalType);

  return (
    <Link href={`/proposals/${proposal.id}`}>
      <HStack alignItems="center" className={styles.proposal_row}>
        <VStack className={cn(styles.cell_content, styles.cell_title)}>
          <HStack className={styles.cell_content_title} gap={1}>
            {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
            <div>
              {proposalText}{" "}
              <span className={styles.invisible_on_mobile}>
                by The Optimism Foundation
              </span>
            </div>
            <div className={styles.mobile_status}>
              <ProposalStatus proposal={proposal} />
            </div>
          </HStack>
          <div className={cn(styles.cell_content_body, styles.proposal_title)}>
            {proposal.markdowntitle.length > 80
              ? `${proposal.markdowntitle.slice(0, 80)}...`
              : proposal.markdowntitle}
          </div>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_status)}>
          <VStack alignItems="flex-end">
            <div className={styles.cell_content_title}>
              <ProposalTimeStatus
                proposalStatus={proposal.status}
                proposalEndTime={proposal.end_time}
              />
            </div>
            <ProposalStatus proposal={proposal} />
          </VStack>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_result)}>
          <div className={styles.cell_content_body}>
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
