import Link from "next/link";
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
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function Proposal({ proposal, votableSupply }) {
  const proposalText = getProposalTypeText(proposal.proposalType);

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
