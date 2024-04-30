"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { HStack, VStack } from "@/components/Layout/Stack";

import { DelegateProfileImage } from "@/components/Delegates/DelegateCard/DelegateProfileImage";
import styles from "@/components/Delegates/DelegateCardList/DelegateCardList.module.scss";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/common/delegates/delegate";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateSocialLinks } from "@/components/Delegates/DelegateCard/DelegateSocialLinks";
import { Button } from "@/components/ui/button";

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
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
  onSelect: (address: string) => void;
}

export default function StakingDelegateCardList({
  initialDelegates,
  fetchDelegates,
  onSelect,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.delegates);
  const { isDelegatesFiltering, setIsDelegatesFiltering } = useAgoraContext();

  useEffect(() => {
    setIsDelegatesFiltering(false);
    setDelegates(initialDelegates.delegates);
    setMeta(initialDelegates.meta);
  }, [initialDelegates, setIsDelegatesFiltering]);

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
        {delegates.map((delegate) => {
          let truncatedStatement = "";

          const twitter = delegate?.statement?.twitter;
          const discord = delegate?.statement?.discord;

          if (delegate?.statement?.payload) {
            const delegateStatement = (
              delegate?.statement?.payload as { delegateStatement: string }
            ).delegateStatement;

            truncatedStatement = delegateStatement.slice(0, 120);
          }

          return (
            <div
              key={delegate.address}
              className={cn(
                styles.link,
                isDelegatesFiltering ? "animate-pulse" : ""
              )}
            >
              <Link href={`/delegates/${delegate.address}`}>
                <VStack gap={4} className={styles.link_container}>
                  <VStack gap={4} justifyContent="justify-center">
                    <DelegateProfileImage
                      address={delegate.address}
                      votingPower={delegate.votingPower}
                      citizen={delegate.citizen}
                    />
                    <p className={styles.summary}>{truncatedStatement}</p>
                  </VStack>
                  <div className="min-h-[24px]">
                    <HStack
                      alignItems="items-stretch"
                      className="justify-between"
                    >
                      <DelegateSocialLinks
                        discord={discord}
                        twitter={twitter}
                      />
                      <Button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onSelect(delegate.address);
                        }}
                      >
                        Select as delegate
                      </Button>
                    </HStack>
                  </div>
                </VStack>
              </Link>
            </div>
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
