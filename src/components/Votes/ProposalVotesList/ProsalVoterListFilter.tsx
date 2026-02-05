"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";
import { FilterIcon } from "@/icons/filter";
import { cn } from "@/lib/utils";
import { VOTER_TYPES } from "@/lib/constants";
import { VoterTypes } from "@/app/api/common/votes/vote";

interface ProposalVoterListFilterProps {
  selectedVoterType: VoterTypes;
  onVoterTypeChange: (type: VoterTypes) => void;
  isOffchain?: boolean;
}

export default function ProposalVoterListFilter({
  selectedVoterType,
  onVoterTypeChange,
  isOffchain = false,
}: ProposalVoterListFilterProps) {
  const availableVoterTypes = isOffchain
    ? VOTER_TYPES.filter((type) => type.type !== "TH")
    : VOTER_TYPES;

  return (
    <div className="flex flex-row items-center justify-between px-4 py-2">
      <span>{selectedVoterType.value}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`text-tertiary cursor-pointer outline-none`}
        >
          <div className="border border-line rounded-lg px-[10px] py-[6px] flex flex-row items-center gap-2">
            <FilterIcon className="stroke-primary" />
            <span className="text-primary">Filter</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={selectedVoterType.type}
            onValueChange={(value: string) => {
              const selectedType = availableVoterTypes.find(
                (type) => type.type === value
              );
              if (selectedType) onVoterTypeChange(selectedType);
            }}
          >
            {availableVoterTypes.map((type) => (
              <DropdownMenuRadioItem
                key={type.value}
                value={type.type}
                checked={type.type === selectedVoterType.type}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-base outline-none transition-colors hover:bg-neutral/50",
                  type.type === selectedVoterType.type
                    ? "text-primary"
                    : "text-secondary"
                )}
              >
                {type.value}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
