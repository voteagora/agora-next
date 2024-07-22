"use client";

import * as React from "react";
import EventCard from "./EventCard";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import {
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";

export default function EventFeed({ initialEvents, fetchEvents }) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialEvents]);
  const [meta, setMeta] = React.useState(initialEvents.meta);

  const loadMore = async (page) => {
    if (!fetching.current && page <= meta.total_pages) {
      fetching.current = true;

      const data = await fetchEvents(page);
      const existingIds = new Set(events.map((e) => e.id));
      const uniqueEvents = data.events.filter((e) => !existingIds.has(e.id));
      setPages((prev) => [...prev, { ...data, events: uniqueEvents }]);
      setMeta(data.meta);

      fetching.current = false;
    }
  };

  const events = pages.reduce((all, page) => all.concat(page.events), []);

  return (
    <InfiniteScroll
      hasMore={pages.length < meta.total_pages}
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
      {events.map((activityItem, activityItemIdx) => (
        <div key={activityItem.id}>
          <div className="relative pb-8">
            {activityItemIdx !== events.length - 1 ? (
              <span
                className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-line"
                aria-hidden="true"
              />
            ) : null}
            <div className="relative flex items-start space-x-3">
              {activityItem.kind === "VOTE_CAST" ? (
                <>
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-line ring-8 ring-white">
                      <UserCircleIcon
                        className="h-5 w-5 text-tertiary"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-1.5">
                    <div className="text-sm text-tertiary">
                      <a href={"#"} className="font-medium text-primary">
                        <p>
                          {JSON.parse(activityItem.event_data).address} casted a
                          vote
                        </p>
                      </a>{" "}
                    </div>
                    <div className="mt-2 text-sm text-secondary">
                      <p>{JSON.parse(activityItem.event_data).reason}</p>
                    </div>
                  </div>
                </>
              ) : activityItem.kind === "DELEGATE_CHANGED" ? (
                <>
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-line ring-8 ring-white">
                      <UserCircleIcon
                        className="h-5 w-5 text-tertiary"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-1.5">
                    <div className="text-sm text-tertiary">
                      Delegation changed by{" "}
                      <a href={"#"} className="font-medium text-primary">
                        <p>{JSON.parse(activityItem.event_data).delegator}</p>
                      </a>
                    </div>
                    <div className="mt-2 text-sm text-secondary">
                      <p>From: {activityItem.event_data.from_delegate}</p>
                      <p>To: {activityItem.event_data.to_delegate}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </InfiniteScroll>
  );
}
