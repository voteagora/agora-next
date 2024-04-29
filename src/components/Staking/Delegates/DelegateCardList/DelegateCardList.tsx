"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { VStack } from "../../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import SelfVotingDelegateCard from "../SelfVotingDelegateCard";
import styles from "./DelegateCardList.module.scss";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/common/delegates/delegate";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { Delegation } from "@/app/api/common/delegations/delegation";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { cn } from "@/lib/utils";
import { useAgoraContext } from "@/contexts/AgoraContext";

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "citizen"
>;

export interface DelegatePaginated {
  seed: number;
  meta: any;
  delegates: DelegateChunk[];
}

interface Props {
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
  fetchDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
  selectedDelegateAddress: string | null;
  setSelectedDelegateAddress: Dispatch<SetStateAction<string | null>>;
}

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
  selectedDelegateAddress,
  setSelectedDelegateAddress,
}: Props) {
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.delegates);

  const { advancedDelegators } = useConnectedDelegate();
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

  const { isAdvancedUser } = useIsAdvancedUser();

  const handleSelectDelegate = (address: string) => {
    setSelectedDelegateAddress(address);
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
        {delegates.map((delegate, index) => {
          let truncatedStatement = "";

          if (delegate?.statement?.payload) {
            const delegateStatement = (
              delegate?.statement?.payload as { delegateStatement: string }
            ).delegateStatement;
            truncatedStatement = delegateStatement.slice(0, 120);
          }

          if (index === 0) {
            return (
              <>
                <SelfVotingDelegateCard
                  address={delegate.address}
                  key={delegate.address}
                />
                <div
                  key={delegate.address}
                  className={cn(
                    styles.link,
                    isDelegatesFiltering ? "animate-pulse" : ""
                  )}
                >
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
                      <DelegateActions
                        delegate={delegate}
                        setSelectedDelegateAddress={setSelectedDelegateAddress}
                      />
                    </div>
                  </VStack>
                </div>
              </>
            );
          } else {
            return (
              <div
                key={delegate.address}
                className={cn(
                  styles.link,
                  isDelegatesFiltering ? "animate-pulse" : ""
                )}
              >
                <VStack
                  gap={4}
                  className={styles.link_container}
                  onClick={() => handleSelectDelegate(delegate.address)}
                >
                  <VStack gap={4} justifyContent="justify-center">
                    <DelegateProfileImage
                      address={delegate.address}
                      votingPower={delegate.votingPower}
                      citizen={delegate.citizen}
                    />
                    <p className={styles.summary}>{truncatedStatement}</p>
                  </VStack>
                  <div className="min-h-[24px]">
                    <DelegateActions
                      delegate={delegate}
                      setSelectedDelegateAddress={setSelectedDelegateAddress}
                    />
                  </div>
                </VStack>
              </div>
            );
          }
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
