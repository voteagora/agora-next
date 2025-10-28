import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { getForumTopics } from "@/lib/actions/forum";
import { transformForumTopics } from "@/lib/forumUtils";
import { RelatedItem } from "../types";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { getArchivedProposals } from "@/lib/actions/archive";

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
  });

  const { data: tempCheckProposals = [], isLoading: isLoadingTempChecks } =
    useQuery({
      queryKey: ["tempCheckProposals"],
      queryFn: async () => {
        const result = await getArchivedProposals("temp-checks");
        if (!result.success) return [];
        return result.data || [];
      },
      enabled: isOpen && searchType === "tempcheck",
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
    } else if (searchType === "tempcheck") {
      if (!tempCheckProposals.length)
        return { results: [], totalResults: 0, totalPages: 0 };

      const filtered = tempCheckProposals.filter((proposal) => {
        if (!debouncedSearchTerm) return true;
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          proposal.title.toLowerCase().includes(searchLower) ||
          proposal.description?.toLowerCase().includes(searchLower)
        );
      });

      const totalResults = filtered.length;
      const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;

      const results = filtered.slice(startIdx, endIdx).map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        description: proposal.description || "",
        comments: 0,
        timestamp: formatDistanceToNow(
          new Date(proposal.start_blocktime * 1000),
          {
            addSuffix: true,
          }
        ),
        url: `/proposals/${proposal.id}`,
      }));

      return { results, totalResults, totalPages };
    } else {
      return { results: [], totalResults: 0, totalPages: 0 };
    }
  }, [searchType, topics, tempCheckProposals, debouncedSearchTerm, page]);

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
    isLoading: isLoadingTopics || isLoadingTempChecks,
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
