"use client";

import InfiniteScroll from "react-infinite-scroller";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { useAccount } from "wagmi";
import DraftProposalCard from "./DraftProposalCard";

const DraftProposalListClient = ({
  initDraftProposals,
  fetchDraftProposals,
}: {
  initDraftProposals: PaginatedResult<any[]>;
  fetchDraftProposals: (
    address: `0x${string}` | undefined,
    filter: string,
    sort: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<any[]>>;
}) => {
  const { address } = useAccount();
  const [pages, setPages] = useState([initDraftProposals]);
  const [meta, setMeta] = useState(initDraftProposals.meta);
  const filter = useSearchParams()?.get("filter") || "relevant";
  const sort = useSearchParams()?.get("sort") || "newest";
  const fetching = useRef(false);

  useEffect(() => {
    const resetAndFetch = async () => {
      fetching.current = true;
      const data = await fetchDraftProposals(address, filter, sort, {
        limit: 10,
        offset: 0,
      });
      setPages([data]);
      setMeta(data.meta);
      fetching.current = false;
    };

    resetAndFetch();
  }, [filter, sort, address]);

  const loadMore = async () => {
    if (fetching.current || !meta.has_next) return;
    fetching.current = true;
    const data = await fetchDraftProposals(address, filter, sort, {
      limit: 10,
      offset: meta.next_offset,
    });
    setPages((prev) => [...prev, { ...data, proposals: data.data }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.data);

  const updateProposalVote = (proposalId: number, vote: any) => {
    console.log("updateProposalVote", proposalId, vote);
  };

  return (
    <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
      <div>
        {proposals.length === 0 ? (
          <div className="flex flex-row justify-center py-8 text-secondary">
            No submissions found
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
              <DraftProposalCard
                key={proposal.id}
                proposal={proposal}
                updateProposalVote={updateProposalVote}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default DraftProposalListClient;
