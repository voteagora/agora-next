"use client";

import { ProposalScope, ProposalType } from "@/app/proposals/draft/types";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { DraftProposalSchema } from "@/app/proposals/draft/schemas/DraftProposalSchema";

function TiersSettings({
  form,
}: {
  form: UseFormReturn<z.output<typeof DraftProposalSchema>>;
}) {
  const proposal_scope = form.watch("proposal_scope");
  const proposalType = form.watch("type");
  const tiers_enabled = form.watch("tiers_enabled");
  const tiers = form.watch("tiers");

  const handleTiersEnabledChange = (enabled: boolean) => {
    if (form.setValue) {
      form.setValue("tiers_enabled", enabled);
      if (!enabled && form.setValue) {
        form.setValue("tiers", []);
      }
    }
  };

  const handleTierChange = (index: number, value: string) => {
    if (form.setValue) {
      const newTiers = [...(tiers || [])];
      const percentage = parseFloat(value);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        const internalValue = Math.round(percentage * 100);
        newTiers[index] = internalValue;
        form.setValue("tiers", newTiers);
      }
    }
  };

  const addTier = () => {
    if (form.setValue) {
      const newTiers = [...(tiers || []), 0];
      form.setValue("tiers", newTiers);
    }
  };

  const removeTier = (index: number) => {
    if (form.setValue) {
      const newTiers = [...(tiers || [])];
      newTiers.splice(index, 1);
      form.setValue("tiers", newTiers);
    }
  };

  const showTiers =
    proposalType === ProposalType.OPTIMISTIC &&
    proposal_scope !== ProposalScope.ONCHAIN_ONLY;

  if (!showTiers) return null;

  return (
    <div className="flex flex-col mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1 text-primary">Tiers</h3>
        <p className="text-sm text-secondary">
          Configure percentage thresholds for this proposal.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          checked={tiers_enabled}
          onCheckedChange={handleTiersEnabledChange}
        />
        <Label className="text-sm text-secondary">Enable tiers</Label>
      </div>

      {tiers_enabled && (
        <div className="flex flex-col w-full gap-3">
          {(tiers || []).map((tier, index) => (
            <div key={index} className="flex w-full gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  value={tier / 100}
                  placeholder="0"
                  onChange={(e) => handleTierChange(index, e.target.value)}
                  className="w-full py-2 px-4 pr-8 rounded-md text-base border-line bg-neutral text-right"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                  %
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTier(index)}
                className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addTier}
            className="w-full mt-2 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>
      )}
    </div>
  );
}

export default TiersSettings;
