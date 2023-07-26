"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroller";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Image from "next/image";

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

  const viewProposal = (proposalId) => {
    router.push(`/proposals/${proposalId}`);
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
              <div
                onClick={() => viewProposal(proposal.uuid)}
                key={proposal.uuid}
                className="my-4 border-b-2"
              >
                ID: {proposal.id}
                <br />
                Start block {proposal.start_block}
                <br />
                End block {proposal.end_block}
                <br />
                <ReactMarkdown>{proposal.markdowntitle}</ReactMarkdown>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}
