"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { ProposalDraft } from "@prisma/client";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import DraftProposalCard from "./DraftProposalCard";
import Tenant from "@/lib/tenant/tenant";
import ClearAllDraftsButton from "./ClearAllDraftsButton";

const MyDraftProposals = ({
  fetchDraftProposals,
  onDraftCountChange,
  onDeleteSuccess,
}: {
  fetchDraftProposals: (address: `0x${string}`) => Promise<ProposalDraft[]>;
  onDraftCountChange?: (count: number) => void;
  onDeleteSuccess?: () => void;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const { address } = useAccount();
  const [draftProposals, setDraftProposals] = useState<ProposalDraft[]>([]);

  const getDraftProposalsAndSet = useCallback(
    async (authorAddress: `0x${string}`) => {
      try {
        const proposals = await fetchDraftProposals(authorAddress);
        setDraftProposals(proposals);
        onDraftCountChange?.(proposals.length);
      } catch (error) {
        console.error("Error fetching draft proposals:", error);
        setDraftProposals([]);
        onDraftCountChange?.(0);
      }
    },
    [fetchDraftProposals, onDraftCountChange]
  );

  useEffect(() => {
    if (!address) {
      setDraftProposals([]);
      onDraftCountChange?.(0);
      return;
    }
    getDraftProposalsAndSet(address);
  }, [address, getDraftProposalsAndSet, onDraftCountChange]);

  if (!plmToggle || !plmToggle.enabled) {
    return null;
  }

  if (!draftProposals.length) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex flex-row justify-between items-center mb-6 mt-4 sm:mt-0">
        <h1 className="text-2xl font-black text-primary">My proposals</h1>
        {address && (
          <ClearAllDraftsButton
            draftCount={draftProposals.length}
            onSuccess={() => {
              if (address) {
                getDraftProposalsAndSet(address);
              }
              onDeleteSuccess?.();
            }}
          />
        )}
      </div>
      <div className="space-y-6">
        {draftProposals.map((proposal) => {
          return (
            <Link
              key={proposal.id}
              href={`/proposals/draft/${proposal.uuid}?stage=${getStageIndexForTenant(proposal.stage)}`}
              className="block"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (
                  target.closest("button") ||
                  target.closest('[role="button"]')
                ) {
                  e.preventDefault();
                }
              }}
            >
              <DraftProposalCard
                proposal={proposal}
                showDelete={true}
                onDeleteSuccess={() => {
                  if (address) {
                    getDraftProposalsAndSet(address);
                  }
                  onDeleteSuccess?.();
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyDraftProposals;
