"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { citizensFilterOptions } from "@/lib/constants";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useRouter } from "next/navigation";
import { useAgoraContext } from "@/contexts/AgoraContext";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import { SortIcon } from "@/icons/Sort";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

type SortOptionProps = {
  label: string;
  value: string;
  checked: boolean;
};

const SortOption = ({ label, value, checked }: SortOptionProps) => (
  <DropdownMenuRadioItem
    value={value}
    checked={checked}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-base outline-none transition-colors hover:bg-neutral/50",
      checked ? "text-primary" : "text-secondary"
    )}
  >
    {label}
  </DropdownMenuRadioItem>
);

export default function CitizensSortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { ui } = Tenant.current();
  const { setIsDelegatesFiltering } = useAgoraContext();

  const [isOpen, setIsOpen] = useState(false);
  const orderByParam = searchParams?.get("citizensOrderBy") || "shuffle";

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value !== "shuffle"
        ? addSearchParam({ name: "citizensOrderBy", value })
        : deleteSearchParam({ name: "citizensOrderBy" }),
      { scroll: false }
    );
    setIsOpen(false);
  };

  const resetSort = (e: React.MouseEvent) => {
    setIsDelegatesFiltering(true);
    router.push(deleteSearchParam({ name: "citizensOrderBy" }), {
      scroll: false,
    });
  };

  return (
    <FilterResetListbox
      triggerLabel="Sort by"
      triggerIcon={
        <SortIcon fill={rgbStringToHex(ui?.customization?.primary)} />
      }
      activeCount={0}
      onReset={resetSort}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="self-stretch p-3 flex flex-col gap-2">
        <DropdownMenu.RadioGroup
          value={orderByParam}
          onValueChange={(value) => handleChange(value)}
        >
          {Object.keys(citizensFilterOptions).map((key) => (
            <SortOption
              key={key}
              label={
                citizensFilterOptions[key as keyof typeof citizensFilterOptions]
                  .value
              }
              value={
                citizensFilterOptions[key as keyof typeof citizensFilterOptions]
                  .sort
              }
              checked={
                citizensFilterOptions[key as keyof typeof citizensFilterOptions]
                  .sort === orderByParam
              }
            />
          ))}
        </DropdownMenu.RadioGroup>
      </div>
    </FilterResetListbox>
  );
}
