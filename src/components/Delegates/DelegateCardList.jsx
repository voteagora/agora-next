"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Image from "next/image";
import Link from "next/link";
import HumanAddress from "../shared/HumanAddress";
import { VStack } from "../Layout/Stack";
import { DelegateProfileImage } from "./DelegateCard/DelegateProfileImage";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

export default function DelegateCardList({ initialDelegates, fetchDelegates }) {
  // const fetching = React.useRef(false);

  // const [meta, setMeta] = React.useState(initialDelegates.meta);

  const loadMore = async (page) => {
    // if (!fetching.current && page <= meta.total_pages) {
    //   fetching.current = true;
    //   const data = await fetchDelegates(page);
    //   const existingIds = new Set(delegates.map((p) => p.id));
    //   const uniqueDelegates = data.delegates.filter(
    //     (p) => !existingIds.has(p.id)
    //   );
    //   setPages((prev) => [...prev, { ...data, delegates: uniqueDelegates }]);
    //   setMeta(data.meta);
    //   fetching.current = false;
    // }
  };

  // const delegates = pages.reduce((all, page) => all.concat(page.delegates), []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <InfiniteScroll
        hasMore={false}
        pageStart={0}
        loadMore={loadMore}
        loader={
          <div key="loader">
            Loading... <br />
            <Image
              src="/images/blink.gif"
              alt="Blinking Agora Logo"
              width={50}
              height={20}
            />
          </div>
        }
        element="main"
      >
        {initialDelegates.delegates.map((delegate) => (
          <div
            key={delegate.address}
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
          >
            <VStack
              alignItems="stretch"
              className={css`
                padding: ${theme.spacing["6"]};
                border-bottom: ${theme.spacing.px} solid
                  ${theme.colors.gray["300"]};
              `}
            >
              <DelegateProfileImage
                address={delegate.address}
                votingPower={delegate.votingPower}
              />
            </VStack>

            <div className="min-w-0 flex-1">
              <Link href={`/delegates/${delegate.address}`}>
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  <HumanAddress address={delegate.address} />
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Voting power: {delegate.votingPower}
                </p>
                <p className="text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Reiciendis ipsa dolor obcaecati, nisi beatae asperiores autem
                  incidunt animi amet perspiciatis inventore enim fuga alias aut
                  doloremque quibusdam exercitationem explicabo praesentium!
                </p>
              </Link>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
