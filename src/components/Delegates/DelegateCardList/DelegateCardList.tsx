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
import { TENANT_NAMESPACES } from "@/lib/constants";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.data);
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();

  useEffect(() => {
    setIsDelegatesFiltering(false);
    setDelegates(initialDelegates.data);
    setMeta(initialDelegates.meta);
  }, [initialDelegates, setIsDelegatesFiltering]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchDelegates(
        { offset: meta.next_offset, limit: meta.total_returned },
        initialDelegates.seed || Math.random()
      );
      setDelegates(delegates.concat(data.data));
      setMeta(data.meta);
      fetching.current = false;
    }
  };
  const isOptimism = Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM;

  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <DialogProvider>
      {isOptimism && <DelegateToSelfBanner />}
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
