"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SearchInput = ({
  onChange,
  onClose = null,
  autoFocus = false,
  className = "",
}) => (
  <div
    className={`w-full sm:w-auto flex flex-row items-center relative ${className}`}
  >
    <div className="absolute z-10 top-3 left-3">
      <MagnifyingGlassIcon className="text-primary w-4 h-4 text-bold" />
    </div>

    <TextInputWithTooltip
      onChange={onChange}
      placeholder="Exact ENS or address"
      tooltipMessage="Please input exact ENS or address. Partial and fuzzy search is not supported yet."
      className={`py-2 ${onClose ? "pr-10" : "pr-2"} pl-8 rounded-sm sm:rounded-lg bg-wash border border-line w-full sm:w-auto placeholder-tertiary/50 text-secondary`}
      autoFocus={autoFocus}
    />

    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="sm:hidden absolute right-3 top-2.5 p-1"
        aria-label="Close search"
      >
        <XMarkIcon className="w-4 h-4 text-tertiary" />
      </button>
    )}
  </div>
);

export default function DelegatesSearch() {
  const router = useRouter();
  const [enteredName, setEnteredName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      enteredName.match(/^(0x)?[0-9a-f]{40}$/i) ||
      enteredName.endsWith(".eth")
    ) {
      router.push(`/delegates/${enteredName}`);
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(true)}
          className="sm:hidden flex items-center justify-center p-3 rounded-sm sm:rounded-lg bg-wash border border-line"
          aria-label="Open search"
        >
          <MagnifyingGlassIcon className="text-primary w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="hidden sm:block">
          <SearchInput onChange={(value) => setEnteredName(value)} />
        </form>
      </>
    );
  }

  // Expanded mobile search input
  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-auto">
      <SearchInput
        onChange={(value) => setEnteredName(value)}
        expanded={true}
        onClose={() => setIsExpanded(false)}
        autoFocus={true}
      />
    </form>
  );
}
