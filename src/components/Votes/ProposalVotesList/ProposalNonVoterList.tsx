"use client";

import { useRef, useState, useCallback } from "react";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import InfiniteScroll from "react-infinite-scroller";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import { Proposal } from "@/app/api/common/proposals/proposal";

const ProposalNonVoterList = ({
  proposal,
  initialNonVoters,
}: {
  proposal: Proposal;
  initialNonVoters: PaginatedResult<any[]>; // TODO: add better types
}) => {
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialNonVoters]);
  const [meta, setMeta] = useState(initialNonVoters.meta);

  const loadMore = useCallback(async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchVotersWhoHaveNotVotedForProposal(proposal.id, {
        limit: 20,
        offset: meta.next_offset,
      });
      setPages((prev) => [...prev, { ...data, votes: data.data }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  }, [proposal, meta]);

  const voters = pages.flatMap((page) => page.data);

  return (
    <div className="px-4 pb-4 overflow-y-scroll max-h-[calc(100vh-437px)]">
      <InfiniteScroll
        hasMore={meta.has_next}
        pageStart={0}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-secondary" key={0}>
            Loading more voters...
          </div>
        }
        element="main"
      >
        <ul className="flex flex-col gap-2">
          {voters.map((voter) => (
            <li key={voter.delegate} className="">
              <ProposalSingleNonVoter voter={voter} proposal={proposal} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
};

export default ProposalNonVoterList;
