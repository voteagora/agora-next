"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/shared/Switch";
import {
  EASVotingType,
  easVotingTypeOptions,
  EASVotingTypeMetadata,
} from "../types";

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
  const metadata = EASVotingTypeMetadata[value];

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-secondary">
        Voting Module
      </Label>
      <Switch
        options={options}
        selection={currentLabel}
        onSelectionChanged={handleSelectionChanged}
      />
      <p className="text-sm text-secondary">{metadata.description}</p>
    </div>
  );
}
