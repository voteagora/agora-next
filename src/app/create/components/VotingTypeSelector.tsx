"use client";

import Tenant from "@/lib/tenant/tenant";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/shared/Switch";
import { easVotingTypeOptions, EASVotingType } from "../types";
import { getAuthoringVotingTypeMetadata } from "@/features/proposals/authoring/shared";

interface VotingTypeSelectorProps {
  value: EASVotingType;
  onChange: (value: EASVotingType) => void;
  disabled?: boolean;
  allowedTypes?: EASVotingType[];
}

export function VotingTypeSelector({
  value,
  onChange,
  disabled = false,
  allowedTypes,
}: VotingTypeSelectorProps) {
  const { namespace } = Tenant.current();
  const availableTypes =
    allowedTypes || (Object.keys(easVotingTypeOptions) as EASVotingType[]);
  const options = availableTypes.map((type) => easVotingTypeOptions[type]);

  const handleSelectionChanged = (selectedLabel: string) => {
    if (disabled) return;
    // Find the type key from the label
    const selectedType = availableTypes.find(
      (type) => easVotingTypeOptions[type] === selectedLabel
    );
    if (selectedType) {
      onChange(selectedType);
    }
  };

  const currentLabel = easVotingTypeOptions[value];
  const metadata = getAuthoringVotingTypeMetadata(value, {
    namespace,
  });

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-secondary">
        Voting Module
      </Label>
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <Switch
          options={options}
          selection={currentLabel}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
      <p className="text-sm text-secondary">
        {disabled
          ? "Voting module is locked to match the selected temp check"
          : metadata.description}
      </p>
    </div>
  );
}
