"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import Link from "next/link";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { cn } from "@/lib/utils";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { trackEvent } from "@/lib/analytics";
import { useAccount } from "wagmi";
import { fetchCitizensServerAction } from "./citizenActions";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  sort: string;
}

export default function CitizenCardList({ initialDelegates, sort }: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.data);
  const { advancedDelegators } = useConnectedDelegate();
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();
  const { address } = useAccount();

  useEffect(() => {
    setIsDelegatesFiltering(false);
    setDelegates(initialDelegates.data);
    setMeta(initialDelegates.meta);
  }, [initialDelegates, setIsDelegatesFiltering]);

  // Create a wrapper function that uses the server action
  const fetchCitizensWrapper = async (
    pagination: PaginationParams,
    seed: number
  ) => {
    return fetchCitizensServerAction(pagination, seed, sort);
  };

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchCitizensWrapper(
        { limit: 20, offset: meta.next_offset },
        initialDelegates.seed || Math.random()
      );
      setDelegates(delegates.concat(data.data));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const { isAdvancedUser } = useIsAdvancedUser();

  useEffect(() => {
    if (address) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.CITIZENS_PAGE_VIEW_WITH_WALLET,
        event_data: {
          address,
        },
      });
    }
  }, [address]);

  return (
    <DialogProvider>
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
        {delegates?.map((delegate) => {
          let truncatedStatement = "";

          if (delegate?.statement?.payload) {
            const delegateStatement =
              delegate?.statement?.payload.delegateStatement;
            truncatedStatement = delegateStatement?.slice(0, 120);
          }

          return (
            <div
              key={delegate.address}
              className={cn(
                "flex flex-col",
                isDelegatesFiltering ? "animate-pulse" : ""
              )}
            >
              <Link href={`/delegates/${delegate.address}`}>
                <div className="flex flex-col gap-4 h-full p-6 rounded-xl bg-white border border-line shadow-newDefault">
                  <div className="flex flex-col gap-4 justify-center">
                    <DelegateProfileImage
                      endorsed={false}
                      address={delegate.address}
                      votingPower={delegate.votingPower.total}
                      citizen={delegate.citizen}
                    />
                    <p className="text-base leading-normal min-h-[48px] break-words text-secondary overflow-hidden line-clamp-2">
                      {truncatedStatement}
                    </p>
                  </div>
                  <div className="min-h-[24px]">
                    <DelegateActions
                      // @ts-ignore
                      delegate={delegate}
                      isAdvancedUser={isAdvancedUser}
                      delegators={advancedDelegators}
                    />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
