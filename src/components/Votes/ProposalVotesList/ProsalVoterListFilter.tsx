"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { FilterIcon } from "@/icons/filter";
import { cn } from "@/lib/utils";
import { VOTER_TYPES } from "@/lib/constants";
import type { VoterTypes } from "@/app/api/common/votes/vote";

interface ProposalVoterListFilterProps {
  selectedVoterType: VoterTypes;
  onVoterTypeChange: (type: VoterTypes) => void;
  showCitizenHouseFilters?: boolean;
}

export default function ProposalVoterListFilter({
  selectedVoterType,
  onVoterTypeChange,
  showCitizenHouseFilters = false,
}: ProposalVoterListFilterProps) {
  const availableVoterTypes = [
    { type: "ALL", value: "All" },
    ...(showCitizenHouseFilters
      ? VOTER_TYPES.map((type) =>
          type.type === "TH"
            ? { ...type, value: "Token House (Delegates)" }
            : type
        )
      : []),
  ];

  if (availableVoterTypes.length <= 1) return null;

  return (
    <div className="text-primary flex-1 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-primary w-full bg-transparent hover:bg-wash transition-colors font-medium rounded-lg py-1.5 px-2 flex items-center justify-between text-[11px] min-h-[32px]"
          >
            <FilterIcon className="stroke-primary w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-left flex-1 leading-tight break-words">
              {selectedVoterType.value}
            </span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-30 hover:opacity-100 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-max min-w-[200px] bg-neutral border border-line p-2 rounded-2xl flex flex-col gap-1 shadow-xl"
        >
          {availableVoterTypes.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onSelect={() => onVoterTypeChange(type)}
              className={cn(
                "cursor-pointer text-xs py-2 px-3 border rounded-xl font-medium",
                selectedVoterType.type === type.type
                  ? "text-primary bg-wash border-line"
                  : "text-tertiary border-transparent hover:bg-wash"
              )}
            >
              {type.value}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
