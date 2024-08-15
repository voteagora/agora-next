"use client";

import { useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";
import { Changelog } from "@/app/api/common/changelogs/changelog";
import { VStack, HStack } from "@/components/Layout/Stack";
import ChangelogListEntry from "./ChangelogListEntry";

const ChangelogList = ({
  initChangelog,
  fetchChangelogForDAO,
}: {
  initChangelog: {
    data: Changelog[];
    meta: { has_next: boolean; next_offset: number };
  };
  fetchChangelogForDAO: (pagination: {
    limit: number;
    offset: number;
  }) => Promise<{
    data: Changelog[];
    meta: { has_next: boolean; next_offset: number };
  }>;
}) => {
  const [changelogEntries, setChangelogEntries] = useState<Changelog[]>(
    initChangelog.data
  );
  const [meta, setMeta] = useState(initChangelog.meta);
  const fetching = useRef(false);

  const loadMore = async () => {
    if (fetching.current || !meta.has_next) return;
    fetching.current = true;

    const data = await fetchChangelogForDAO({
      limit: 10,
      offset: meta.next_offset,
    });
    setChangelogEntries((prev) => [...prev, ...data.data]);
    setMeta(data.meta);

    fetching.current = false;
  };

  if (!changelogEntries.length) {
    return <div>No changelog entries found.</div>;
  }

  return (
    <VStack className="max-w-[76rem]">
      <VStack className="bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
        <div>
          <InfiniteScroll
            hasMore={meta.has_next}
            pageStart={0}
            loadMore={loadMore}
            loader={
              <div key={0}>
                <HStack
                  key="loader"
                  className="gl_loader justify-center py-6 text-sm text-secondary"
                >
                  Loading...
                </HStack>
              </div>
            }
            element="main"
          >
            {changelogEntries.map((changelogEntry) => (
              <ChangelogListEntry
                key={changelogEntry.id}
                changelogEntry={changelogEntry}
              />
            ))}
          </InfiniteScroll>
        </div>
      </VStack>
    </VStack>
  );
};

export default ChangelogList;
