"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ArrowDownAZ } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VotesSort, VotesSortOrder } from "@/app/api/common/votes/vote";

export type SortParams = {
  sortKey: VotesSort;
  sortOrder: VotesSortOrder;
  label: string;
};

const sortOptions: SortParams[] = [
  {
    sortKey: "block_number",
    sortOrder: "desc",
    label: "Most Recent",
  },
  {
    sortKey: "block_number",
    sortOrder: "asc",
    label: "Oldest",
  },
  {
    sortKey: "weight",
    sortOrder: "desc",
    label: "Most Voting Power",
  },
  {
    sortKey: "weight",
    sortOrder: "asc",
    label: "Least Voting Power",
  },
];

interface ProposalVotesSortProps {
  sortOption: SortParams;
  onSortChange: (option: SortParams) => void;
  hideTimeSortOptions?: boolean;
}

export default function ProposalVotesSort({
  sortOption,
  onSortChange,
  hideTimeSortOptions = false,
}: ProposalVotesSortProps) {
  const visibleOptions = hideTimeSortOptions
    ? sortOptions.filter((opt) => opt.sortKey !== "block_number")
    : sortOptions;

  return (
    <div className="text-primary ml-auto flex-1 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-primary w-full bg-transparent hover:bg-wash transition-colors font-medium rounded-lg py-1.5 px-2 flex items-center justify-between text-[11px] min-h-[32px]"
          >
            <ArrowDownAZ className="stroke-primary w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-left flex-1 leading-tight break-words">
              {sortOption.label}
            </span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-30 hover:opacity-100 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-max min-w-[180px] bg-neutral border border-line p-2 rounded-2xl flex flex-col gap-1 shadow-xl"
        >
          {visibleOptions.map((option) => (
            <DropdownMenuItem
              key={option.label}
              onSelect={() => onSortChange(option)}
              className={cn(
                "cursor-pointer text-xs py-2 px-3 border rounded-xl font-medium",
                sortOption.label === option.label
                  ? "text-primary bg-wash border-line"
                  : "text-tertiary border-transparent hover:bg-wash"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
