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
    <div className="relative text-primary">
      <Listbox
        value={sortOption.label}
        onChange={(value: string) => {
          const selected = sortOptions.find((opt) => opt.label === value);
          if (selected) onSortChange(selected);
        }}
      >
        <Listbox.Button className="text-primary w-full sm:w-fit bg-neutral font-medium border border-line rounded-lg py-2 px-3 flex items-center justify-between text-xs h-auto min-h-[32px]">
          <ArrowDownAZ className="stroke-primary w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-left leading-tight break-words max-w-[100px] sm:max-w-none">
            {sortOption.label}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-30 hover:opacity-100 flex-shrink-0" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-neutral border border-line p-2 rounded-2xl flex flex-col gap-1 z-50 w-max right-0 shadow-xl">
          {visibleOptions.map((option) => (
            <Listbox.Option key={option.label} value={option.label}>
              {({ selected }) => (
                <div
                  className={cn(
                    "cursor-pointer text-xs py-2 px-3 border rounded-xl font-medium",
                    selected
                      ? "text-primary bg-wash border-line"
                      : "text-tertiary border-transparent hover:bg-wash"
                  )}
                >
                  {option.label}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}
