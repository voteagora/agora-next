"use client";

import { useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Changelog } from "@/app/api/common/changelogs/changelog";
import ChangelogListEntry from "./ChangelogListEntry";
import Image from "next/image";

interface ChangelogListProps {
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
}

const ChangelogList: React.FC<ChangelogListProps> = ({
  initChangelog,
  fetchChangelogForDAO,
}) => {
  const [changelogEntries, setChangelogEntries] = useState<Changelog[]>(
    initChangelog.data
  );
  const [meta, setMeta] = useState(initChangelog.meta);
  const fetching = useRef(false);

  const loadMore = async (_page: number) => {
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
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Times are not a changin&apos;
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          It seems nothing has happened on the change log yet.
        </p>
        <div className="mt-8">
          <Image
            alt="Vacationing changelog"
            src="https://i.pinimg.com/originals/97/52/18/97521834afab9745868c144cfe189b69.gif"
            width={300}
            height={300}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <InfiniteScroll
        hasMore={meta.has_next}
        pageStart={0}
        loadMore={loadMore}
        loader={
          <div
            key={0}
            className="gl_loader flex flex-row justify-center py-6 text-sm text-secondary"
          >
            Loading...
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
  );
};

export default ChangelogList;
