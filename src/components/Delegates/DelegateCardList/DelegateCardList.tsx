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
  banner?: React.ReactNode;
  fetchDelegates: (args: {
    pagination?: PaginationParams;
    seed?: number;
    showParticipation?: boolean;
  }) => Promise<PaginatedResult<DelegateChunk[]>>;
}

const batchSize = 50;

export default function DelegateCardList({
  initialDelegates,
  banner,
  fetchDelegates,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(
    initialDelegates.data.slice(0, batchSize)
  );
  const [dataFromServer, setDataFromServer] = useState<DelegateChunk[]>(
    initialDelegates.data
  );
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const showParticipation =
    (ui.toggle("show-participation")?.enabled || false) &&
    !(ui.toggle("hide-participation-delegates-page")?.enabled || false);

  useEffect(() => {
    setDelegates(initialDelegates.data.slice(0, batchSize));
    setMeta(initialDelegates.meta);
    setDataFromServer(initialDelegates.data);
    setIsDelegatesFiltering(false);
  }, [initialDelegates, setIsDelegatesFiltering]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next && !isDelegatesFiltering) {
      try {
        fetching.current = true;

        // Check if we have more initial data to show
        const remainingInitialData = dataFromServer.slice(delegates.length);

        if (remainingInitialData.length > 0) {
          const nextBatch = remainingInitialData.slice(0, batchSize);
          setDelegates((prev) => [...prev, ...nextBatch]);
          setMeta((prev) => ({
            ...prev,
            has_next: remainingInitialData.length > batchSize,
            next_offset: meta.next_offset + nextBatch.length,
          }));
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
          setDataFromServer((prev) => [...prev, ...data.data]);
          setDelegates((prev) => [...prev, ...data.data.slice(0, batchSize)]);
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
      <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg mt-6">
        {banner}
        {/* @ts-ignore */}
        <InfiniteScroll
          className="grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-around sm:justify-between py-4 gap-4 sm:gap-8"
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
                key={delegate.address + idx}
                delegate={delegate}
                truncatedStatement={truncatedStatement}
                isDelegatesFiltering={isDelegatesFiltering}
                isAdvancedUser={isAdvancedUser}
              />
            );
          })}
        </InfiniteScroll>
      </div>
    </DialogProvider>
  );
}
