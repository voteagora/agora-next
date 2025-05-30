"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import DelegateCard from "./DelegateCard";
import { stripMarkdown } from "@/lib/sanitizationUtils";
import { DelegateToSelfBanner } from "./DelegateToSelfBanner";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (args: {
    pagination?: PaginationParams;
    seed?: number;
    showParticipation?: boolean;
  }) => Promise<PaginatedResult<DelegateChunk[]>>;
}

const batchSize = 50;

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(
    initialDelegates.data.slice(0, batchSize)
  );
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const showParticipation = ui.toggle("show-participation")?.enabled || false;

  useEffect(() => {
    setIsDelegatesFiltering(false);
    setDelegates(initialDelegates.data.slice(0, batchSize));
    setMeta(initialDelegates.meta);
  }, [initialDelegates, setIsDelegatesFiltering]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      try {
        fetching.current = true;

        // Check if we have more initial data to show
        const remainingInitialData = initialDelegates.data.slice(
          delegates.length
        );

        if (remainingInitialData.length > 0) {
          const nextBatch = remainingInitialData.slice(0, batchSize);
          setDelegates((prev) => [...prev, ...nextBatch]);

        } else {
          // No more initial data, fetch from API
          const data = await fetchDelegates({
            pagination: {
              offset: meta.next_offset,
              limit: meta.total_returned,
            },
            seed: initialDelegates.seed || Math.random(),
            showParticipation,
          });
          setDelegates((prev) => [...prev, ...data.data]);
          setMeta(data.meta);
        }
      } catch (error) {
        console.error("Error loading more delegates:", error);
      } finally {
        fetching.current = false;
      }
    }
  };

  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <DialogProvider>
      {isDelegationEncouragementEnabled && <DelegateToSelfBanner />}
      {/* @ts-ignore */}
      <InfiniteScroll
        className="grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3  justify-around sm:justify-between py-4 gap-4 sm:gap-8"
        hasMore={meta.has_next}
        pageStart={1}
        loadMore={loadMore}
        loader={
          <div
            className="w-full h-full min-h-[140px] bg-wash rounded-xl text-tertiary flex items-center justify-center"
            key="loader"
          >
            Loading...
          </div>
        }
        element="div"
      >
        {delegates?.map((delegate, idx) => {
          let truncatedStatement = "";

          if (delegate?.statement?.payload) {
            const delegateStatement = (
              delegate?.statement?.payload as { delegateStatement: string }
            ).delegateStatement;

            const plainTextStatement = stripMarkdown(delegateStatement);
            truncatedStatement = plainTextStatement.slice(0, 120);
          }

          return (
            <DelegateCard
              key={idx}
              delegate={delegate}
              truncatedStatement={truncatedStatement}
              isDelegatesFiltering={isDelegatesFiltering}
              isAdvancedUser={isAdvancedUser}
            />
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
