"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { VStack } from "../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import styles from "./DelegateCardList.module.scss";
import { useRouter } from "next/navigation";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/common/delegates/delegate";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import Link from "next/link";
import { Delegation } from "@/app/api/common/delegations/delegation";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "citizen"
>;

interface DelegatePaginated {
  meta: any;
  delegates: DelegateChunk[];
}

interface Props {
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number) => Promise<DelegatePaginated>;
  fetchDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
}

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const router = useRouter();
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialDelegates] || []);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const { advancedDelegators } = useConnectedDelegate();

  useEffect(() => {
    setPages([initialDelegates]);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

  const loadMore = async (page: any) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegates(page);
      const existingIds = new Set(
        pages.flatMap((page) => page.delegates.map((d) => d.address))
      );
      const uniqueDelegates = data.delegates.filter(
        (d) => !existingIds.has(d.address)
      );
      setPages((prev) => [...prev, { ...data, delegates: uniqueDelegates }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const delegates = pages.reduce(
    (all: DelegateChunk[], page) => all.concat(page.delegates),
    []
  );
  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <DialogProvider>
      {/* @ts-ignore */}
      <InfiniteScroll
        className={styles.infinite_scroll}
        hasMore={meta.hasNextPage}
        pageStart={0}
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
        {delegates.map((delegate, i) => {
          let truncatedStatement = "";

          if (delegate?.statement?.payload) {
            const delegateStatement = (
              delegate?.statement?.payload as { delegateStatement: string }
            ).delegateStatement;
            truncatedStatement = delegateStatement.slice(0, 120);
          }

          return (
            <div key={delegate.address} className={styles.link}>
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
                    <DelegateActions
                      delegate={delegate}
                      isAdvancedUser={isAdvancedUser}
                      delegators={advancedDelegators}
                    />
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
