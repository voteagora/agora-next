"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroller";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { getHumanBlockTime } from "@/lib/blockTimes";
import Image from "next/image";
import Link from "next/link";

export default function ProposalsList({ initialProposals, fetchProposals }) {
  const router = useRouter();
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposals]);
  const [meta, setMeta] = React.useState(initialProposals.meta);

  const loadMore = async (page) => {
    if (!fetching.current && page <= meta.total_pages) {
      fetching.current = true;

      const data = await fetchProposals(page);
      const existingIds = new Set(proposals.map((p) => p.id));
      const uniqueProposals = data.proposals.filter(
        (p) => !existingIds.has(p.id)
      );
      setPages((prev) => [...prev, { ...data, proposals: uniqueProposals }]);
      setMeta(data.meta);

      fetching.current = false;
    }
  };

  const proposals = pages.reduce((all, page) => all.concat(page.proposals), []);

  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
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
            {proposals.map((proposal) => (
              <div key={proposal.id} className="my-4 border-b-2">
                proposal by {proposal.proposer}
                <br />
                <p>Start time: {proposal.start_time}</p>
                <br />
                <p>End time: {proposal.end_time}</p>
                <br />
                <Link href={`/proposals/${proposal.id}`}>
                  <ReactMarkdown>{proposal.markdowntitle}</ReactMarkdown>
                </Link>
                <br />
                <p>Proposal Data: {proposal.proposaData}</p>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}
