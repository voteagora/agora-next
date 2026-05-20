"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import search from "@/icons/search.svg";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useRef } from "react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";

export default function RetroPGFSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { search: searchParam = "" } = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();

  const handleSearch = (value: string) => {
    navigate({
      to: (value
        ? addSearchParam({ name: "search", value })
        : deleteSearchParam({ name: "search" })) as never,
    });
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
          className="py-2 pr-4 pl-8 rounded-full bg-wash border border-line w-full placeholder-gray-af"
        />
        <img
          className="absolute top-[50%] left-3 hidden sm:inline transform -translate-y-1/2 pointer-events-none"
          src={search as string}
          alt="Search projects"
        />
      </div>
    </form>
  );
}
