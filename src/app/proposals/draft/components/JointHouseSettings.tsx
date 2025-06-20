"use client";

import { VStack } from "@/components/Layout/Stack";
import { Switch } from "@/components/shared/Switch";
import { ProposalScope } from "@/app/proposals/draft/types";
import { UseFormReturn } from "react-hook-form";
import { DraftProposalSchema } from "@/app/proposals/draft/schemas/DraftProposalSchema";
import { z } from "zod";

const proposalScopeOptions = {
  [ProposalScope.ONCHAIN_ONLY]: "On-Chain Only",
  [ProposalScope.OFFCHAIN_ONLY]: "Off-Chain Only (Citizens)",
  [ProposalScope.HYBRID]: "Hybrid (On-Chain & Off-Chain)",
};

function JointHouseSettings({
  form,
}: {
  form: UseFormReturn<z.output<typeof DraftProposalSchema>>;
}) {
  const proposal_scope = form.watch("proposal_scope");

  const handleScopeChange = (selectedOption: string) => {
    const scope = Object.keys(proposalScopeOptions).find(
      (key) => proposalScopeOptions[key as ProposalScope] === selectedOption
    ) as ProposalScope | undefined;

    if (scope) {
      if (form.setValue) {
        form.setValue("proposal_scope", scope);
      }
    }
  };

  return (
    <VStack>
      <div className="mb-1">
        <h3 className="text-lg font-semibold mb-2 text-primary">
          Proposal Scope
        </h3>
        <p className="text-sm text-secondary">
          Select the voting mechanism for this proposal.
        </p>
      </div>

      <Switch
        options={Object.values(proposalScopeOptions)}
        selection={
          proposal_scope
            ? proposalScopeOptions[proposal_scope]
            : proposalScopeOptions[ProposalScope.ONCHAIN_ONLY]
        }
        onSelectionChanged={handleScopeChange}
      />

      {/* Display note if scope is off-chain or hybrid */}
      {(proposal_scope === ProposalScope.OFFCHAIN_ONLY ||
        proposal_scope === ProposalScope.HYBRID) && (
        <div className="text-xs text-secondary bg-wash p-3 rounded border border-line mt-2">
          <p>
            <strong>Note:</strong>
            {proposal_scope === ProposalScope.OFFCHAIN_ONLY &&
              " This proposal will be voted on by the Citizen House using off-chain mechanisms."}
            {proposal_scope === ProposalScope.HYBRID &&
              " This proposal will include both on-chain Token House voting and parallel EAS-based Citizen House voting."}
          </p>
        </div>
      )}
    </VStack>
  );
}

export default JointHouseSettings;
