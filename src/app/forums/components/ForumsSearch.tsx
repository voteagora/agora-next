"use client";

import React from "react";
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch";
import type { SearchClient } from "instantsearch.js";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { createForumSearchConfig } from "@/lib/instantSearch";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { stripHtmlToText } from "@/app/forums/stripHtml";

interface ForumsSearchProps {
  className?: string;
}

interface ForumTopicHit {
  objectID: string;
  topicId?: number;
  title?: string;
  content?: string;
  categoryName?: string;
  createdAt?: number;
  contentType?: "topic" | "post" | "category";
  topicTitle?: string;
  _formatted?: {
    title?: string;
    topicTitle?: string;
    content?: string;
  };
}

interface SearchInputProps {
  placeholder?: string;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onQueryChange?: (value: string) => void;
  registerClear?: (fn: () => void) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  onFocus,
  onBlur,
  onQueryChange,
  registerClear,
}) => {
  const { query, refine } = useSearchBox();
  const [inputValue, setInputValue] = React.useState(query);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setInputValue(value);
    onQueryChange?.(value);
    refine(value);
  };

  React.useEffect(() => {
    setInputValue(query);
  }, [query]);

  React.useEffect(() => {
    if (!registerClear) return;
    registerClear(() => {
      setInputValue("");
      onQueryChange?.("");
      refine("");
    });
  }, [registerClear, refine, onQueryChange]);

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder || "Search discussions"}
        className="w-full rounded-md border border-cardBorder bg-card py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Search forum topics"
      />
    </div>
  );
};

interface DropdownHitsProps {
  open: boolean;
  onSelect: (hit: ForumTopicHit) => void;
}

const DropdownHits: React.FC<DropdownHitsProps> = ({ open, onSelect }) => {
  const { items } = useHits<ForumTopicHit>();

  const filteredHits = React.useMemo(() => {
    const seenTopicIds = new Set<number>();

    return items.filter((hit) => {
      if (!hit.topicId) {
        return false;
      }

      if (seenTopicIds.has(hit.topicId)) {
        return false;
      }

      seenTopicIds.add(hit.topicId);
      return true;
    });
  }, [items]);

  if (!open) return null;

  return (
    <div className="absolute z-20 mt-2 w-full rounded-md border border-cardBorder bg-card shadow-lg">
      {filteredHits.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-500">No matches found.</div>
      ) : (
        <ul className="max-h-72 overflow-y-auto py-2">
          {filteredHits.map((hit) => {
            const content = stripHtmlToText(hit.content || "");
            const contextLabel =
              hit.contentType === "post" && hit.topicTitle
                ? `in ${hit.topicTitle}`
                : null;
            const createdAt = formatDate(hit.createdAt);
            return (
              <li key={hit.objectID}>
                <button
                  type="button"
                  onClick={() => onSelect(hit)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {content}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {hit.categoryName && (
                      <span className="mr-2 uppercase tracking-wide">
                        {hit.categoryName}
                      </span>
                    )}
                    {contextLabel && (
                      <span className="mr-2 lowercase tracking-wide">
                        {contextLabel}
                      </span>
                    )}
                    {createdAt && <span>· {createdAt}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

function formatDate(timestamp?: number): string | null {
  if (!timestamp) return null;
  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString();
}

const ForumsSearch: React.FC<ForumsSearchProps> = ({ className }) => {
  const router = useRouter();
  const [isFocused, setIsFocused] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const clearRef = React.useRef<(() => void) | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const daoSlug = React.useMemo(() => Tenant.current().slug, []);

  const searchConfig = React.useMemo(
    () => createForumSearchConfig(daoSlug),
    [daoSlug]
  );

  const searchClient = searchConfig.searchClient as unknown as SearchClient;
  const { indexName } = searchConfig;
  const hasValidIndex = Boolean(indexName);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = React.useCallback(
    (hit: ForumTopicHit) => {
      if (!hit?.topicId) {
        return;
      }
      const title =
        hit.contentType === "post"
          ? hit.topicTitle || hit.title || ""
          : hit.title || "";
      const path = buildForumTopicPath(hit.topicId, title);
      setIsFocused(false);
      setQuery("");
      clearRef.current?.();
      router.push(path);
    },
    [router]
  );

  const isOpen = isFocused && query.trim().length > 0;

  if (!hasValidIndex) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <SearchInput
          placeholder="Search discussions"
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            const nextFocus = event.relatedTarget as HTMLElement | null;
            if (!nextFocus || !containerRef.current?.contains(nextFocus)) {
              setTimeout(() => setIsFocused(false), 100);
            }
          }}
          onQueryChange={setQuery}
          registerClear={(fn) => {
            clearRef.current = fn;
          }}
        />
        <DropdownHits open={isOpen} onSelect={handleSelect} />
      </InstantSearch>
    </div>
  );
};

export default ForumsSearch;
