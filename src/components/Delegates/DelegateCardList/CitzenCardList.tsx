"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import Link from "next/link";
import { Delegation } from "@/app/api/common/delegations/delegation";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { cn } from "@/lib/utils";
import { useAgoraContext } from "@/contexts/AgoraContext";

export type Citizen = {
  address: `0x${string}`;
  votingPower: string;
  citizen: boolean;
  statement: {
    signature: string;
    payload: {
      email: string;
      daoSlug: string;
      discord: string;
      twitter: string;
      warpcast: string;
      topIssues: string[];
      agreeCodeConduct: boolean;
      delegateStatement: string;
      mostValuableProposals: string[];
      leastValuableProposals: string[];
      openToSponsoringProposals: boolean;
    };
    twitter: string;
    discord: string;
    created_at: Date;
    updated_at: Date;
    warpcast: string;
  };
};

interface CitizenPaginated {
  seed: number;
  meta: any;
  delegates: Citizen[];
}

interface Props {
  isDelegatesCitizensFetching: boolean;
  initialDelegates: CitizenPaginated;
  fetchDelegates: (page: number, seed: number) => Promise<CitizenPaginated>;
  fetchDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
}

export default function CitizenCardList({
  initialDelegates,
  fetchDelegates,
  isDelegatesCitizensFetching,
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
        initialDelegates.seed || Math.random()
      );
      setDelegates(delegates.concat(data.delegates));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const { isAdvancedUser } = useIsAdvancedUser();

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
                isDelegatesCitizensFetching || isDelegatesFiltering
                  ? "animate-pulse"
                  : ""
              )}
            >
              <Link href={`/delegates/${delegate.address}`}>
                <div className="flex flex-col gap-4 h-full p-6 rounded-xl bg-white border border-line shadow-newDefault">
                  <div className="flex flex-col gap-4 justify-center">
                    <DelegateProfileImage
                      endorsed={false}
                      address={delegate.address}
                      votingPower={delegate.votingPower}
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
