"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OptimisticProposalSettings,
  defaultOptimisticSettings,
} from "../types";

interface OptimisticSettingsInputProps {
  settings: OptimisticProposalSettings;
  onChange: (settings: OptimisticProposalSettings) => void;
}

export function OptimisticSettingsInput({
  settings,
  onChange,
}: OptimisticSettingsInputProps) {
  const handleThresholdChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange({
        ...settings,
        tiers: [num],
      });
    }
  };

  const currentThreshold =
    settings.tiers[0] || defaultOptimisticSettings.tiers[0];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-secondary">
          Veto Threshold
        </Label>
        <p className="text-xs text-secondary mt-1">
          Percentage of votes required to veto (reject) the proposal
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={100}
          value={currentThreshold}
          onChange={(e) => handleThresholdChange(e.target.value)}
          className="w-24"
        />
        <span className="text-sm text-secondary">%</span>
      </div>

      <div className="p-3 bg-wash rounded-lg">
        <p className="text-xs text-secondary">
          <strong>How it works:</strong> The proposal passes automatically
          unless {currentThreshold}% or more of voters vote against (veto) it.
        </p>
      </div>
    </div>
  );
}
