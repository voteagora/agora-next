"use client";

import * as React from "react";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import { VStack } from "../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import styles from "./DelegateCardList.module.scss";
import { useRouter } from "next/navigation";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}) {
  const router = useRouter();
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialDelegates] || []);
  const [meta, setMeta] = React.useState(initialDelegates.meta);

  useEffect(() => {
    setPages([initialDelegates]);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const handleClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  };

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegates(page);
      const existingIds = new Set(delegates.map((d) => d.address));
      const uniqueDelegates = data.delegates.filter(
        (d) => !existingIds.has(d.address)
      );
      setPages((prev) => [...prev, { ...data, delegates: uniqueDelegates }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const delegates = pages.reduce((all, page) => all.concat(page.delegates), []);

  return (
    <DialogProvider>
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

          if (delegate.statement && delegate.statement.delegateStatement) {
            truncatedStatement = delegate.statement.delegateStatement.slice(
              0,
              120
            );
          }

          return (
            <div
              key={delegate.address}
              onClick={(e) => handleClick(e, `/delegates/${delegate.address}`)}
              className={styles.link}
            >
              <VStack className={styles.link_container}>
                <VStack gap="4" className="h-full">
                  <VStack justifyContent="center">
                    <DelegateProfileImage
                      address={delegate.address}
                      votingPower={delegate.votingPower}
                    />
                  </VStack>
                  <p className={styles.summary}>{truncatedStatement}</p>
                  <div className="flex-grow" />
                  <DelegateActions
                    address={delegate.address}
                    votingPower={delegate.votingPower}
                    discord={delegate?.statement?.discord}
                    twitter={delegate?.statement?.twitter}
                    fetchBalanceForDirectDelegation={
                      fetchBalanceForDirectDelegation
                    }
                    fetchVotingPowerForSubdelegation={
                      fetchVotingPowerForSubdelegation
                    }
                    checkIfDelegatingToProxy={checkIfDelegatingToProxy}
                    fetchCurrentDelegatees={fetchCurrentDelegatees}
                    getProxyAddress={getProxyAddress}
                  />
                </VStack>
              </VStack>
            </div>
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
