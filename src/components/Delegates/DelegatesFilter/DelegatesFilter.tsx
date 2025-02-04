"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { delegatesFilterOptions } from "@/lib/constants";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import FilterListbox from "@/components/common/FilterListbox";

export default function DelegatesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const orderByParam = searchParams?.get("orderBy") || "weightedRandom";
  const { setIsDelegatesFiltering } = useAgoraContext();

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === delegatesFilterOptions.weightedRandom.value
        ? deleteSearchParam({ name: "orderBy" })
        : addSearchParam({ name: "orderBy", value }),
      { scroll: false }
    );
  };

  return (
    <FilterListbox
      value={orderByParam}
      onChange={handleChange}
      options={delegatesFilterOptions}
    />
  );
}
