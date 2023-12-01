import Link from "next/link";
import styles from "./proposal.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";
import { TokenAmountDisplay, pluralize } from "@/lib/utils";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import OPApprovalProposalStatus from "./OPApprovalProposalStatus";
import ProposalTimeStatus from "./ProposalTimeStatus";
import { cn } from "@/lib/utils";

export default function Proposal({ proposal }) {
  return (
    <Link href={`/proposals/${proposal.id}`}>
      <HStack alignItems="center" className={styles.proposal_row}>
        <VStack className={cn(styles.cell_content, styles.cell_title)}
        >
          <div className={styles.cell_content_title}>
            <>
              Proposal by {proposal.proposer}
              <span className={styles.proposal_status}></span>
            </>
          </div>
          <div className={styles.cell_content_body}>
            {proposal.markdowntitle.length > 80
              ? `${proposal.markdowntitle.slice(0, 80)}...`
              : proposal.markdowntitle}
          </div>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_status)}>
          <div className={styles.cell_content_title}>Status</div>
          <div className={styles.cell_content_body}>
            <ProposalStatus proposal={proposal} />
          </div>
        </VStack>
        <VStack className={cn(styles.cell_content, styles.cell_result)}>
          <div className={styles.cell_content_title}>
            <ProposalTimeStatus
              proposalStatus={proposal.status}
              proposalEndTime={proposal.end_time}
            />
          </div>
          <div className={styles.cell_content_body}>
            {proposal.proposalType === "STANDARD" &&
              proposal.proposalResults && (
                <OPStandardProposalStatus proposal={proposal} />
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
