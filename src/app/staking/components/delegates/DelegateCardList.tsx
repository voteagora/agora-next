"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { capitalizeFirstLetter } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { DelegateCard } from "@/app/staking/components/delegates/DelegateCard";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { getTruncatedStatement } from "@/lib/delegateUtils";

interface Props {
  address: string;
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (args: {
    pagination?: PaginationParams;
    seed?: number;
    showParticipation?: boolean;
  }) => Promise<PaginatedResult<DelegateChunk[]>>;
  onSelect: (address: string) => void;
}

export default function DelegateCardList({
  address,
  initialDelegates,
  fetchDelegates,
  onSelect,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.data);
  const { namespace, ui } = Tenant.current();

  const showParticipation = ui.toggle("show-participation")?.enabled || false;

  useEffect(() => {
    setDelegates(initialDelegates.data);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      console.log("🥵 showParticipation - C", showParticipation);

      const data = await fetchDelegates({
        pagination: {
          limit: meta.total_returned,
          offset: meta.next_offset,
        },
        seed: initialDelegates.seed || Math.random(),
        showParticipation,
      });

      setDelegates(delegates.concat(data.data));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  return (
    <DialogProvider>
      {/* @ts-ignore */}
      <InfiniteScroll
        className="grid grid-flow-row grid-cols-[repeat(auto-fit,_23rem)] sm:grid-cols-[repeat(3,_23rem)] justify-around sm:justify-between py-4 gap-4 sm:gap-8"
        hasMore={meta.has_next}
        pageStart={1}
        loadMore={loadMore}
        loader={
          <div
            className="w-full h-full min-h-[140px] bg-slate-50 rounded-xl text-secondary flex items-center justify-center"
            key="loader"
          >
            Loading...
          </div>
        }
        element="div"
      >
        <DelegateCard
          key={address}
          address={address}
          onSelect={onSelect}
          statement={`Delegate your votes to yourself to engage directly in ${capitalizeFirstLetter(namespace)} governance.`}
          action={"I’ll vote myself"}
        />
        {delegates.map((delegate) => {
          // Filter out the current user from the list of delegates
          if (delegate.address !== address.toLowerCase()) {
            const twitter = delegate?.statement?.twitter;
            const discord = delegate?.statement?.discord;
            const warpcast = delegate?.statement?.warpcast;
            const truncatedStatement = getTruncatedStatement(delegate, 120);

            return (
              <DelegateCard
                action={"Select as delegate"}
                address={delegate.address}
                discord={discord}
                key={delegate.address}
                onSelect={onSelect}
                statement={truncatedStatement}
                twitter={twitter}
                votingPower={delegate.votingPower.total}
                warpcast={warpcast}
              />
            );
          }
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
