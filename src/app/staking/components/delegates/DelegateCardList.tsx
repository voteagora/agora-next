"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "@/components/Delegates/DelegateCardList/DelegateCardList.module.scss";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { capitalizeFirstLetter } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { DelegateCard } from "@/app/staking/components/delegates/DelegateCard";

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "citizen"
>;

interface DelegatePaginated {
  seed: number;
  meta: any;
  delegates: DelegateChunk[];
}

interface Props {
  address: string;
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
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
  const [delegates, setDelegates] = useState(initialDelegates.delegates);
  const { namespace } = Tenant.current();

  useEffect(() => {
    setDelegates(initialDelegates.delegates);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const loadMore = async () => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegates(
        meta.currentPage + 1,
        initialDelegates.seed
      );
      setDelegates(delegates.concat(data.delegates));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  return (
    <DialogProvider>
      {/* @ts-ignore */}
      <InfiniteScroll
        className={styles.infinite_scroll}
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        loader={
          <div
            className="w-full h-full min-h-[140px] bg-slate-50 rounded-xl text-slate-300 flex items-center justify-center"
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
            let truncatedStatement = "";

            const twitter = delegate?.statement?.twitter;
            const discord = delegate?.statement?.discord;
            const warpcast = delegate?.statement?.warpcast;

            if (delegate?.statement?.payload) {
              const delegateStatement = (
                delegate?.statement?.payload as { delegateStatement: string }
              ).delegateStatement;

              truncatedStatement = delegateStatement.slice(0, 120);
            }

            return (
              <DelegateCard
                action={"Select as delegate"}
                address={delegate.address}
                discord={discord}
                key={delegate.address}
                onSelect={onSelect}
                statement={truncatedStatement}
                twitter={twitter}
                votingPower={delegate.votingPower}
                warpcast={warpcast}
              />
            );
          }
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
