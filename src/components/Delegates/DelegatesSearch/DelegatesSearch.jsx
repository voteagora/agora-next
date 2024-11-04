"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
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
      <div className="w-full sm:w-auto flex flex-row items-center relative">
        <div className="absolute z-10 top-3 left-3">
          <MagnifyingGlassIcon className="text-secondary w-4 h-4" />
        </div>

        <TextInputWithTooltip
          onChange={(value) => setEnteredName(value)}
          placeholder="Exact ENS or address"
          tooltipMessage="Please input exact ENS or address. Partial and fuzzy search is not supported yet."
          className="py-2 px-4 pl-8 rounded-full bg-wash border border-line w-full sm:w-auto placeholder-tertiary/50 text-secondary"
        />
      </div>
    </form>
  );
}
