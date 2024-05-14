"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import search from "@/icons/search.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import Image from "next/image";

export default function RetroPGFSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams?.get("search") || "";
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();

  const handleSearch = (value: string) => {
    router.push(
      value
        ? addSearchParam({ name: "search", value })
        : deleteSearchParam({ name: "search" }),
      {
        scroll: false,
      }
    );
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="relative">
        <TextInputWithTooltip
          onChange={handleSearch}
          inputRef={inputRef}
          defaultValue={searchParam}
          placeholder="Search projects"
          tooltipMessage="Searches project names and descriptions"
          className="py-2 pr-4 pl-8 rounded-full bg-gray-fa border border-gray-eb w-full placeholder-gray-af"
        />
        <Image
          className="absolute top-[50%] left-3 hidden sm:inline transform -translate-y-1/2 pointer-events-none"
          src={search}
          alt="Search projects"
        />
      </div>
    </form>
  );
}
