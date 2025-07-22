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

export type VoterTypes = {
  type: string;
  value: string;
};

export const VoterTypes = [
  {
    type: "citizenHouseApps",
    value: "Citizen House: Apps",
  },
  {
    type: "citizenHouseChains",
    value: "Citizen House: Chains",
  },
  {
    type: "citizenHouseUsers",
    value: "Citizen House: Users",
  },
  {
    type: "TH",
    value: "Token House",
  },
];

interface ProposalVoterListFilterProps {
  selectedVoterType: VoterTypes;
  onVoterTypeChange: (type: VoterTypes) => void;
}

export default function ProposalVoterListFilter({
  selectedVoterType,
  onVoterTypeChange,
}: ProposalVoterListFilterProps) {
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
              const selectedType = VoterTypes.find(
                (type) => type.type === value
              );
              if (selectedType) onVoterTypeChange(selectedType);
            }}
          >
            {VoterTypes.map((type) => (
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
