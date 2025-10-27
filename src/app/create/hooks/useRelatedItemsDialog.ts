import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { getForumTopics } from "@/lib/actions/forum";
import { transformForumTopics } from "@/lib/forumUtils";
import { RelatedItem } from "../types";
import { buildForumTopicPath } from "@/lib/forumUtils";

interface UseRelatedItemsDialogProps {
  searchType: "forum" | "tempcheck";
  onSelect: (item: RelatedItem) => void;
  existingItemIds: string[];
}

const ITEMS_PER_PAGE = 20;

export function useRelatedItemsDialog({
  searchType,
  onSelect,
  existingItemIds,
}: UseRelatedItemsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: topics = [], isLoading: isLoadingTopics } = useQuery({
    queryKey: ["forumTopics"],
    queryFn: async () => {
      const result = await getForumTopics({});
      if (!result.success || !("data" in result)) return [];
      return transformForumTopics(result.data);
    },
    enabled: isOpen && searchType === "forum",
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const { results, totalResults, totalPages } = useMemo(() => {
    if (searchType === "forum") {
      if (!topics.length)
        return { results: [], totalResults: 0, totalPages: 0 };

      const filtered = topics.filter((topic) => {
        if (!debouncedSearchTerm) return true;
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          topic.title.toLowerCase().includes(searchLower) ||
          topic.content?.toLowerCase().includes(searchLower)
        );
      });

      const totalResults = filtered.length;
      const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;

      const results = filtered.slice(startIdx, endIdx).map((topic) => ({
        id: topic.id.toString(),
        title: topic.title,
        description: topic.content || "",
        comments: topic.comments?.length || 0,
        timestamp: formatDistanceToNow(new Date(topic.createdAt), {
          addSuffix: true,
        }),
        url: buildForumTopicPath(topic.id, topic.title),
      }));

      return { results, totalResults, totalPages };
    } else {
      return { results: [], totalResults: 0, totalPages: 0 };
    }
  }, [searchType, topics, debouncedSearchTerm, page]);

  const handleSelect = useCallback(
    (item: RelatedItem) => {
      if (existingItemIds.includes(item.id)) {
        return;
      }
      onSelect(item);
      setIsOpen(false);
      setSearchTerm("");
      setPage(1);
    },
    [onSelect, existingItemIds]
  );

  const openDialog = useCallback(() => {
    setIsOpen(true);
    setPage(1);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    isOpen,
    searchTerm,
    results,
    isLoading: isLoadingTopics,
    openDialog,
    closeDialog,
    setSearchTerm,
    handleSearch: () => {},
    handleSelect,
    setIsOpen,
    page,
    totalPages,
    totalResults,
    nextPage,
    prevPage,
  };
}
