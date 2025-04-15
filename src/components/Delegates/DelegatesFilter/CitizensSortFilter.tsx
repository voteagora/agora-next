"use client";

import { useState } from "react";
import { citizensFilterOptions } from "@/lib/constants";
import { useAgoraContext } from "@/contexts/AgoraContext";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import { SortIcon } from "@/icons/Sort";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { SortOption } from "./FilterSortOption";
import { useCitizensSort } from "./useCitizensSort";

export default function CitizensSortFilter() {
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { ui } = Tenant.current();
  const [isOpen, setIsOpen] = useState(false);
  const { orderByParam, handleSortChange, resetSort } = useCitizensSort();

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    handleSortChange(value);
    setIsOpen(false);
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
          value={orderByParam || "shuffle"}
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
                  .sort === (orderByParam || "shuffle")
              }
            />
          ))}
        </DropdownMenu.RadioGroup>
      </div>
    </FilterResetListbox>
  );
}
