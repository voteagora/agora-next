import React, { useState, useEffect } from "react";
import AgoraAPI from "@/app/lib/agoraAPI";
import HumanAddress from "@/components/shared/HumanAddress";
import HumanVote from "@/components/shared/HumanVote";
import Image from "next/image";

// A function to fetch votes
async function fetchVotesForProposal(proposal, page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal.uuid}/votes?page=${page}`);
  return data;
}

// ProposalVotes Component
export const ProposalVotes = ({ proposal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [votes, setVotes] = useState([]);
  const [meta, setMeta] = useState({});

  // Fetch votes when the component mounts and when currentPage changes
  useEffect(() => {
    fetchVotesForProposal(proposal, currentPage)
      .then(({ votes, meta }) => {
        setVotes(votes);
        setMeta(meta);
      })
      .catch((error) => {
        console.error("Failed to fetch votes", error);
      });
  }, [proposal, currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // While votes are loading
  if (votes.length === 0) {
    return (
      <div>
        Loading... <br />
        <Image
          src="/images/blink.gif"
          alt="Blinking Agora Logo"
          width={50}
          height={20}
        />
      </div>
    );
  }

  return (
    <ul>
      {votes.map((vote) => (
        <li key={vote.address}>
          <p>
            <HumanAddress address={vote.address} /> voted{" "}
            <HumanVote support={vote.support} />
            {vote.reason}
          </p>
        </li>
      ))}
      <button onClick={goToPreviousPage} disabled={currentPage === 1}>
        Previous Page
      </button>
      <button onClick={goToNextPage} disabled={votes.length < meta.page_size}>
        Next Page
      </button>
    </ul>
  );
};
