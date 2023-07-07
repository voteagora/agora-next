"use client";
import AgoraAPI from "@/app/lib/agoraAPI";
import React from "react";
import HumanAddress from "@/components/shared/HumanAddress";
import HumanVote from "@/components/shared/HumanVote";

async function getVotesForProposal(proposal, page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal.uuid}/votes?page=${page}`);
  return { votes: data.votes, meta: data.meta };
}

// ProposalVotes Component
export const ProposalVotes = ({ proposal }) => {
  const [votes, setVotes] = React.useState([]);
  const [meta, setMeta] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    getVotesForProposal(proposal,currentPage).then(({ votes, meta }) => {
      setVotes(votes);
      setMeta(meta);
    });
  }, [currentPage, proposal]);

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
  };

  return (
    <ul>
      {votes.map((vote) => (
        <li key={vote.id}>
          <p>
            <HumanAddress address={vote.address} /> voted{" "}
            <HumanVote support={vote.support} />
            {vote.reason}
          </p>
        </li>
      ))}
    </ul>
  );
};
