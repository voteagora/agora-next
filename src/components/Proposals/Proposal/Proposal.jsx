import Link from "next/link";
import styles from "./proposal.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";
import { TokenAmountDisplay, pluralize } from "@/lib/utils";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import OPApprovalProposalStatus from "./OPApprovalProposalStatus";
import ProposalTimeStatus from "./ProposalTimeStatus";

export default function Proposal({ proposal }) {
  return (
    <Link href={`/proposals/${proposal.id}`}>
      <HStack
        justifyContent="justify-between"
        alignItems="items-start"
        className="p-4 border-b-2"
      >
        <VStack
          className={styles.cell_content_primary}
          alignItems="items-start"
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
        <VStack className={styles.cell_content} alignItems="items-center">
          <div className={styles.cell_content_title}>Title</div>
          <div className={styles.cell_content_body}>
            <ProposalStatus proposal={proposal} />
          </div>
        </VStack>
        <VStack className={styles.cell_content} alignItems="items-end">
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
