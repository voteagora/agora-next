"use client";

import { Switch } from "@/components/shared/Switch";
import { CalculationOptions, ProposalScope } from "@/app/proposals/draft/types";
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
  const calculationOptions = form.watch("calculationOptions");

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

  const handleCalculationOptionsChange = (selectedOption: string) => {
    const calculationOptions = Object.values(CalculationOptions).find(
      (key) => key === selectedOption
    ) as CalculationOptions | undefined;

    const calculationOptionsNumber =
      calculationOptions === CalculationOptions.INCLUDE_ABSTAIN ? 0 : 1;

    if (calculationOptions) {
      if (form.setValue) {
        form.setValue("calculationOptions", calculationOptionsNumber);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-1">
        <h3 className="text-sm font-semibold mb-2 text-primary">
          Proposal Scope
        </h3>
        <p className="text-xs text-secondary">
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
              " This proposal will be voted on by the Citizen House using off-chain mechanisms. Weights: 1/3 (Chains) / 1/3 (Apps) / 1/3 (Users)"}
            {proposal_scope === ProposalScope.HYBRID &&
              " This proposal will include both on-chain Token House voting and parallel EAS-based Citizen House voting. Weights: 1/2 (Token House) / 1/6 (Chains) / 1/6 (Apps) / 1/6 (Users)"}
          </p>
        </div>
      )}

      {/* {proposal_scope !== ProposalScope.ONCHAIN_ONLY && (
        <>
          <div className="flex flex-col space-y-2 mt-6">
            <h3 className="text-sm font-semibold mb-2 text-primary">
              Calculation Options
            </h3>
            <p className="text-xs text-secondary">
              Select the calculation options for this proposal.
            </p>
          </div>

          <Switch
            options={Object.values(CalculationOptions)}
            selection={
              calculationOptions
                ? calculationOptions === 1
                  ? CalculationOptions.EXCLUDE_ABSTAIN
                  : CalculationOptions.INCLUDE_ABSTAIN
                : CalculationOptions.INCLUDE_ABSTAIN
            }
            onSelectionChanged={handleCalculationOptionsChange}
          />
        </>
      )} */}
    </div>
  );
}

export default JointHouseSettings;
