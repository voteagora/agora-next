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
import DelegatesPageInfoBanner from "../DelegatesPageInfoBanner";
import { useInfoBannerVisibility } from "@/hooks/useInfoBannerVisibility";

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
  const [dataFromServer, setDataFromServer] = useState<DelegateChunk[]>(
    initialDelegates.data
  );
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();
  const { ui, namespace } = Tenant.current();
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

  // Check if banner is visible
  const isBannerVisible = useInfoBannerVisibility("delegates-page-info-banner");

  return (
    <DialogProvider>
      {isDelegationEncouragementEnabled && <DelegateToSelfBanner />}
      <div className="relative">
        <DelegatesPageInfoBanner />
        <div className={`relative z-10 ${isBannerVisible ? "mt-6" : "mt-4"}`}>
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
                <div
                  key={delegate.address + idx}
                  className="relative flex flex-col w-full h-full"
                >
                  {idx === 0 && (
                    <svg
                      className="absolute -top-8 -left-8 w-24 h-24 z-50 text-teal-400 drop-shadow-2xl opacity-90 pointer-events-none rotate-12"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <polygon points="50,15 100,100 0,100" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg
                      className="absolute -top-10 -right-10 w-28 h-28 z-50 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.7)] opacity-100 pointer-events-none animate-pulse rotate-[35deg]"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <polygon points="50,5 61,38 96,38 68,59 79,91 50,70 21,91 32,59 4,38 39,38" />
                    </svg>
                  )}
                  <DelegateCard
                    delegate={delegate}
                    truncatedStatement={truncatedStatement}
                    isDelegatesFiltering={isDelegatesFiltering}
                    isAdvancedUser={isAdvancedUser}
                  />
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
      </div>
    </DialogProvider>
  );
}
