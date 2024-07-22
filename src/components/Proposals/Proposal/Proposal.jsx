import Link from "next/link";
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
  const { ui } = Tenant.current();
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
      <HStack alignItems="center" className="border-b border-line">
        <VStack
          className={cn(
            "whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          {proposal.proposalType === "SNAPSHOT" ? (
            <HStack className="text-xs text-secondary" gap={1}>
              <p>Snapshot Proposal</p>
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mt-1" />
            </HStack>
          ) : (
            <HStack className="text-xs text-secondary" gap={1}>
              {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
              <div>
                {proposalText}{" "}
                <span className="hidden sm:block">
                  {Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM ? (
                    `by The ${ui.organization.title}`
                  ) : (
                    <>
                      by <HumanAddress address={proposal.proposer} />{" "}
                    </>
                  )}
                </span>
              </div>
              <div className="block sm:hidden">
                <ProposalStatus proposal={proposal} />
              </div>
            </HStack>
          )}
          <div
            className={`overflow-ellipsis overflow-visible whitespace-normal break-words`}
          >
            {proposal.markdowntitle.length > 80
              ? `${proposal.markdowntitle.slice(0, 80)}...`
              : proposal.markdowntitle}
          </div>
        </VStack>
        <VStack className="whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[20%] flex-start justify-center hidden sm:block">
          <VStack alignItems="flex-end">
            <div className="text-xs text-secondary">
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
        <VStack className="whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[20%] flex-start justify-center hidden sm:block">
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
            {proposal.proposalType === "APPROVAL" && proposal.proposalData && (
              <OPApprovalProposalStatus proposal={proposal} />
            )}
          </div>
        </VStack>
      </HStack>
    </Link>
  );
}
