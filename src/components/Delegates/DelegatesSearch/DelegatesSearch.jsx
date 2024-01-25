"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import { VStack } from "@/components/Layout/Stack";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";

export default function DelegatesSearch() {
  const router = useRouter();
  const [enteredName, setEnteredName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (
          enteredName.match(/^(0x)?[0-9a-f]{40}$/i) ||
          enteredName.endsWith(".eth")
        ) {
          router.push(`/delegates/${enteredName}`);
        }
      }}
    >
      <VStack className="relative">
        <VStack className="justify-center absolute left-0 top-0 bottom-0 p-2">
          <MagnifyingGlassIcon className="text-gray-4f w-4 h-4" />
        </VStack>
        <TextInputWithTooltip
          onChange={(value) => setEnteredName(value)}
          placeholder="Exact ENS or address"
          tooltipMessage="Please input exact ENS or address. Partial and fuzzy search is not supported yet."
          className="py-2 px-4 pl-8 rounded-full bg-gray-fa border border-[#ebebeb] w-full 2xl:w-auto placeholder-gray-af"
        />
      </VStack>
    </form>
  );
}
