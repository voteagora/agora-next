"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";
import { ArrowDownAZ } from "lucide-react";
import { cn } from "@/lib/utils";
import { VotesSort, VotesSortOrder } from "@/app/api/common/votes/vote";

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
}

export default function ProposalVotesSort({
  sortOption,
  onSortChange,
}: ProposalVotesSortProps) {
  return (
    <div className="flex flex-row items-center justify-between px-4 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`text-tertiary cursor-pointer outline-none`}
        >
          <div className="border border-line rounded-lg px-[10px] py-[6px] flex flex-row items-center gap-2">
            <ArrowDownAZ className="stroke-primary w-4 h-4" />
            <span className="text-primary text-xs font-medium">Sort by</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup
            value={sortOption.label}
            onValueChange={(value: string) => {
              const selected = sortOptions.find((opt) => opt.label === value);
              if (selected) onSortChange(selected);
            }}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.label}
                value={option.label}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-xs outline-none transition-colors hover:bg-neutral/50",
                  option.label === sortOption.label
                    ? "text-primary font-semibold"
                    : "text-secondary"
                )}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
