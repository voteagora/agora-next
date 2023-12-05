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
      <SelectTrigger className="w-fit focus:ring-0 bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
        <SelectValue placeholder={defaultValue} />
      </SelectTrigger>
      <SelectContent className="bg-[#F7F7F7] p-2 rounded-[1rem]">
        {Object.entries(delegatesFilterOptions).map(([key, value]) => (
          <SelectItem
            key={key}
            value={key}
            className="bg-white text-black py-2 px-3 border rounded-xl border-[#ebebeb] text-base box-border"
          >
            {value.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
