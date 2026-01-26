"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
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
  const availableVoterTypes = [
    { type: "ALL", value: "All" },
    ...(isOffchain
      ? VOTER_TYPES.filter((type) => type.type !== "TH")
      : VOTER_TYPES),
  ];

  return (
    <div className="relative text-primary">
      <Listbox
        value={selectedVoterType.type}
        onChange={(value: string) => {
          const selectedType = availableVoterTypes.find(
            (type) => type.type === value
          );
          if (selectedType) onVoterTypeChange(selectedType);
        }}
      >
        <Listbox.Button className="text-primary w-full bg-neutral font-medium border border-line rounded-lg py-1 px-3 flex items-center justify-between text-xs">
          <FilterIcon className="stroke-primary w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{selectedVoterType.value}</span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-30 hover:opacity-100 flex-shrink-0" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-neutral border border-line p-2 rounded-2xl flex flex-col gap-1 z-50 w-max shadow-xl">
          {availableVoterTypes.map((type) => (
            <Listbox.Option key={type.value} value={type.type}>
              {({ selected }) => (
                <div
                  className={cn(
                    "cursor-pointer text-xs py-2 px-3 border rounded-xl font-medium",
                    selected
                      ? "text-primary bg-wash border-line"
                      : "text-tertiary border-transparent hover:bg-wash"
                  )}
                >
                  {type.value}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}
