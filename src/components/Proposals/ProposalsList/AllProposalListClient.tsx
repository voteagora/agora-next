"use client";

import InfiniteScroll from "react-infinite-scroller";
import Proposal from "../Proposal/Proposal";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { Proposal as ProposalType } from "@/app/api/common/proposals/proposal";

const AllProposalListClient = ({
  initProposals,
  fetchProposals,
  votableSupply,
}: {
  initProposals: PaginatedResult<ProposalType[]>;
  fetchProposals: (
    filter: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<ProposalType[]>>;
  votableSupply: string;
}) => {
  const [pages, setPages] = useState([initProposals]);
  const [meta, setMeta] = useState(initProposals.meta);
  const filter = useSearchParams()?.get("filter") || "relevant";
  const fetching = useRef(false);

  const loadMore = async () => {
    if (fetching.current || !meta.has_next) return;
    fetching.current = true;
    const data = await fetchProposals(filter, {
      limit: 10,
      offset: meta.next_offset,
    });
    setPages((prev) => [...prev, { ...data, proposals: data.data }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.data);

  return (
    <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
      <div>
        {proposals.length === 0 ? (
          <div className="flex flex-row justify-center py-8 text-secondary">
            No proposals currently
          </div>
        ) : (
          <InfiniteScroll
            hasMore={meta.has_next}
            pageStart={0}
            loadMore={loadMore}
            loader={
              <div key={0}>
                <div
                  key="loader"
                  className="flex flex-row gl_loader justify-center py-6 text-sm text-secondary"
                >
                  Loading...
                </div>
              </div>
            }
            element="main"
          >
            {proposals.map((proposal) => (
              <Proposal
                key={`${proposal.id}_${proposal.status}`}
                proposal={proposal}
                votableSupply={votableSupply}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default AllProposalListClient;
