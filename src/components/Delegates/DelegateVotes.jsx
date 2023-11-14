"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import HumanVote from "../shared/HumanVote";
import HumanAddress from "../shared/HumanAddress";
import Image from "next/image";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DelegateVotes({ initialVotes, fetchDelegateVotes }) {
  // const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialVotes]);
  // const [meta, setMeta] = React.useState(initialVotes.meta);

  const loadMore = async (page) => {
    // if (!fetching.current && page <= meta.total_pages) {
    //   fetching.current = true;
    //   const data = await fetchDelegateVotes(page);
    //   const existingIds = new Set(delegateVotes.map((v) => v.id));
    //   const uniqueDelegateVotes = data.delegateVotes.filter(
    //     (p) => !existingIds.has(p.id)
    //   );
    //   setPages((prev) => [
    //     ...prev,
    //     { ...data, delegateVotes: uniqueDelegateVotes },
    //   ]);
    //   setMeta(data.meta);
    //   fetching.current = false;
    // }
  };

  const delegateVotes = pages.reduce(
    (all, page) => all.concat(page.delegateVotes),
    []
  );

  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <ul role="list" className="space-y-6">
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
              {delegateVotes.map(
                (vote, voteIdx) =>
                  vote && (
                    <li
                      key={vote.address}
                      className="relative flex gap-x-4 w-full"
                    >
                      <div
                        className={classNames(
                          voteIdx === delegateVotes.length - 1
                            ? "h-6"
                            : "-bottom-6",
                          "absolute left-0 top-0 flex w-6 justify-center"
                        )}
                      >
                        <div className="w-px bg-gray-200" />
                      </div>

                      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                      </div>
                      <div
                        className={classNames(
                          "flex-auto rounded-md p-3 ring-1 ring-inset",
                          vote.support === 1 ? "ring-green-200" : "ring-red-200"
                        )}
                      >
                        <div className="flex justify-between gap-x-4">
                          <div className="py-0.5 text-xs leading-5 text-gray-500">
                            <span className="font-medium text-gray-900">
                              <HumanAddress address={vote.address} />
                            </span>{" "}
                            voted <HumanVote support={vote.support} />
                          </div>
                          <time
                            dateTime="2023-01-24T09:20"
                            className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                          >
                            1d ago
                          </time>
                        </div>
                        <p className="text-sm leading-6 text-gray-500">
                          {vote.reason}
                        </p>
                      </div>
                    </li>
                  )
              )}
            </InfiniteScroll>
          </ul>
        </div>
      </div>
    </div>
  );
}
