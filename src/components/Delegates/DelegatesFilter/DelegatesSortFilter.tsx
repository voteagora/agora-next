"use client";

import { useState } from "react";
import { delegatesFilterOptions } from "@/lib/constants";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import { SortIcon } from "@/icons/Sort";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { SortOption } from "./FilterSortOption";
import { useDelegatesSort } from "./useDelegatesSort";

export default function DelegatesSortFilter() {
  const { ui } = Tenant.current();
  const [isOpen, setIsOpen] = useState(false);

  // Use shared sort hook
  const { orderByParam, handleSortChange, resetSort } = useDelegatesSort();

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
          onValueChange={(value) => handleSortChange(value)}
        >
          {Object.keys(delegatesFilterOptions).map((key) => (
            <SortOption
              key={key}
              label={
                delegatesFilterOptions[
                  key as keyof typeof delegatesFilterOptions
                ].value
              }
              value={
                delegatesFilterOptions[
                  key as keyof typeof delegatesFilterOptions
                ].sort
              }
              checked={
                delegatesFilterOptions[
                  key as keyof typeof delegatesFilterOptions
                ].sort === orderByParam
              }
            />
          ))}
        </DropdownMenu.RadioGroup>
      </div>
    </FilterResetListbox>
  );
}
