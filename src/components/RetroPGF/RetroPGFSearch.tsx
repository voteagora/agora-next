"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import { VStack } from "@/components/Layout/Stack";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";

export default function RetroPGFSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams?.get("search") || "";
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();

  const handleSearch = (value: string) => {
    router.push(
      value ? addSearchParam("search", value) : deleteSearchParam("search"),
      {
        scroll: false,
      }
    );
  };

  return (
    // TODO: frh -> glass-icon, styles
    <form onSubmit={(e) => e.preventDefault()}>
      <TextInputWithTooltip
        onChange={handleSearch}
        inputRef={inputRef}
        defaultValue={searchParam}
        placeholder="Search projects"
        tooltipMessage="Searches project names and descriptions"
        // className={css`
        //   padding: ${theme.spacing["2"]} ${theme.spacing["4"]};
        //   padding-left: ${theme.spacing["8"]};
        //   border-radius: ${theme.borderRadius.full};
        //   background: #fafafa;
        //   border-color: #ebebeb;
        //   border-width: 1px;
        //   width: 100%;

        //   &::placeholder {
        //     color: #afafaf;
        //   }
        // `}
      />
    </form>
  );
}
