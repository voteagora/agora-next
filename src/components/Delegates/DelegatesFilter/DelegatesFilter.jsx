"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { delegatesFilterOptions } from "@/lib/constants";

// TODO: frh -> style this component, and check if transition is faster
export default function DelegatesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderByParam = searchParams.get("orderBy");
  const defaultValue = delegatesFilterOptions[orderByParam]?.value
    ? orderByParam
    : "weightedRandom";

  const handleChanges = (value) => {
    value === "weightedRandom"
      ? router.push("/delegates")
      : router.push(`/delegates/?orderBy=${value}`);
  };

  return (
    <Select
      onValueChange={(value) => handleChanges(value)}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={defaultValue} />
      </SelectTrigger>

      <SelectContent>
        {Object.entries(delegatesFilterOptions).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
