"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import Link from "next/link";
import { VStack } from "../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import styles from "./DelegateCardList.module.scss";

export default function DelegateCardList({ initialDelegates, fetchDelegates }) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialDelegates] || []);
  const [meta, setMeta] = React.useState(initialDelegates.meta);

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
    <InfiniteScroll
      className={styles.infinite_scroll}
      hasMore={meta.hasNextPage}
      pageStart={0}
      loadMore={loadMore}
      loader={
        <div key="loader">
          Loading...
          <Image
            src="/images/blink.gif"
            alt="Blinking Agora Logo"
            width={50}
            height={20}
          />
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
          <Link
            key={i}
            href={`/delegates/${delegate.address}`}
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
                />
              </VStack>
            </VStack>
          </Link>
        );
      })}
    </InfiniteScroll>
  );
}
