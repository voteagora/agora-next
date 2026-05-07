import { useCallback, useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";

const SCROLL_THRESHOLD_PX = 240;

export function useVisibleRows({
  pageSize,
  resetKey,
  totalCount,
}: {
  pageSize: number;
  resetKey: string;
  totalCount: number;
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, totalCount));
  }, [pageSize, totalCount]);

  const loadMoreIfNeeded = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || !hasMore) {
        return;
      }

      const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;

      if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
        loadMore();
      }
    },
    [hasMore, loadMore]
  );

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      loadMoreIfNeeded(event.currentTarget);
    },
    [loadMoreIfNeeded]
  );

  useEffect(() => {
    setVisibleCount(pageSize);

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pageSize, resetKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      loadMoreIfNeeded(containerRef.current);
    });

    return () => cancelAnimationFrame(frame);
  }, [loadMoreIfNeeded, visibleCount, totalCount]);

  return {
    containerRef,
    handleScroll,
    hasMore,
    visibleCount,
  };
}
