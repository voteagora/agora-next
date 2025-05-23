"use client";

import { Form } from "./CreateProposalForm";
import { VStack } from "@/components/Layout/Stack";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function JointHouseSettings({ form }: { form: Form }) {
  const { citizenVotingEnabled } = form.state;

  return (
    <VStack className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-primary">
          Joint-House Voting
        </h3>
        <p className="text-sm text-secondary mb-4">
          Enable parallel Citizen House voting alongside Token House voting via
          EAS attestations.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="citizen-voting"
          checked={citizenVotingEnabled}
          onCheckedChange={(checked) =>
            form.onChange.citizenVotingEnabled(checked as boolean)
          }
        />
        <Label htmlFor="citizen-voting" className="text-sm font-medium">
          Enable Citizen House voting
        </Label>
      </div>

      {citizenVotingEnabled && (
        <div className="text-xs text-secondary bg-wash p-3 rounded border border-line">
          <p>
            <strong>Note:</strong> This proposal will include both on-chain
            Token House voting and parallel EAS-based Citizen House voting.
          </p>
        </div>
      )}
    </VStack>
  );
}

export default JointHouseSettings;
