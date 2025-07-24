import Link from "next/link";
import ProposalStatus from "../ProposalStatus/ProposalStatus";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import OPApprovalProposalStatus, {
  OffchainApprovalProposalStatus,
} from "./OPApprovalProposalStatus";
import ProposalTimeStatus from "./ProposalTimeStatus";
import { cn, getProposalTypeText } from "@/lib/utils";
import OPOptimisticProposalStatus from "./OPOptimisticProposalStatus";
import SnapshotProposalStatus from "./SnapshotProposalStatus";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import ENSName from "@/components/shared/ENSName";
import HybridStandardProposalStatus from "./HybridStandardProposalStatus";
import { HybridOptimisticProposalStatus } from "./HybridOptimisticProposalStatus";

export default function Proposal({
  proposal,
  votableSupply,
}: {
  proposal: Proposal;
  votableSupply: string;
}) {
  const { ui } = Tenant.current();
  const proposalText = getProposalTypeText(
    proposal.proposalType ?? "",
    proposal.proposalType === "SNAPSHOT"
      ? (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
      : undefined
  );

  const shouldNavigateToSnapshot =
    proposal.proposalType === "SNAPSHOT" &&
    (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])?.type !==
      "copeland";

  return (
    <Link
      href={
        shouldNavigateToSnapshot
          ? (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
              .link
          : `/proposals/${proposal.id}`
      }
      target={shouldNavigateToSnapshot ? "_blank" : ""}
    >
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          {shouldNavigateToSnapshot ? (
            <div className="flex flex-row text-xs text-secondary gap-1">
              <p>Snapshot Proposal</p>
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mt-1" />
            </div>
          ) : (
            <div className="flex flex-row text-xs text-secondary gap-1">
              {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
              <div>
                {proposalText}{" "}
                <span className="hidden sm:inline">
                  {Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM ? (
                    `by The ${ui.organization?.title}`
                  ) : (
                    <>
                      by <ENSName address={proposal.proposer} />{" "}
                    </>
                  )}
                </span>
              </div>
              <div className="block sm:hidden">
                <ProposalStatus proposal={proposal} />
              </div>
            </div>
          )}
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {proposal.markdowntitle.length > 80
              ? `${proposal.markdowntitle.slice(0, 80)}...`
              : proposal.markdowntitle}
          </div>
        </div>
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end">
            <div className="text-xs text-secondary">
              <ProposalTimeStatus
                proposalStatus={proposal.status}
                proposalStartTime={proposal.startTime}
                proposalEndTime={proposal.endTime}
                proposalCancelledTime={proposal.cancelledTime}
                proposalExecutedTime={proposal.executedTime}
              />
            </div>
            <ProposalStatus proposal={proposal} />
          </div>
        </div>
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
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
            {(proposal.proposalType === "APPROVAL" ||
              proposal.proposalType === "HYBRID_APPROVAL") &&
              proposal.proposalData && (
                <OPApprovalProposalStatus proposal={proposal} />
              )}
            {proposal.proposalType === "OFFCHAIN_APPROVAL" &&
              proposal.proposalData && (
                <OffchainApprovalProposalStatus proposal={proposal} />
              )}
            {(proposal.proposalType === "HYBRID_STANDARD" ||
              proposal.proposalType === "OFFCHAIN_STANDARD") &&
              proposal.proposalData && (
                <HybridStandardProposalStatus proposal={proposal} />
              )}
            {(proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED" ||
              proposal.proposalType === "OFFCHAIN_OPTIMISTIC" ||
              proposal.proposalType === "OFFCHAIN_OPTIMISTIC_TIERED") && (
              <HybridOptimisticProposalStatus proposal={proposal} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
