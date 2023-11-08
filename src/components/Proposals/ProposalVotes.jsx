import React, { useState, useEffect } from "react";
import AgoraAPI from "@/app/lib/agoraAPI";
import HumanAddress from "@/components/shared/HumanAddress";
import HumanVote from "@/components/shared/HumanVote";
import Image from "next/image";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// A function to fetch votes
async function fetchVotesForProposal(proposal_id, page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal_id}/votes?page=${page}`);
  return data;
}

// ProposalVotes Component
export const ProposalVotes = ({ proposal_id }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [votes, setVotes] = useState([]);
  const [meta, setMeta] = useState({});

  // Fetch votes when the component mounts and when currentPage changes
  useEffect(() => {
    fetchVotesForProposal(proposal_id, currentPage)
      .then(({ votes, meta }) => {
        setVotes(votes);
        setMeta(meta);
      })
      .catch((error) => {
        console.error("Failed to fetch votes", error);
      });
  }, [proposal_id, currentPage]);

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
    <ul role="list" className="space-y-6">
      {votes.map((vote, voteIdx) => (
        <li key={vote.address} className="relative flex gap-x-4 w-full">
          <div
            className={classNames(
              voteIdx === votes.length - 1 ? "h-6" : "-bottom-6",
              "absolute left-0 top-0 flex w-6 justify-center"
            )}
          >
            <div className="w-px bg-gray-200" />
          </div>

          <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
          </div>
          <div
            className={classNames(
              "flex-auto rounded-md p-3 ring-1 ring-inset",
              vote.support === 1 ? "ring-green-200" : "ring-red-200"
            )}
          >
            <div className="flex justify-between gap-x-4">
              <div className="py-0.5 text-xs leading-5 text-gray-500">
                <span className="font-medium text-gray-900">
                  <HumanAddress address={vote.address} />
                </span>{" "}
                voted <HumanVote support={vote.support} />
              </div>
              <time
                dateTime="2023-01-24T09:20"
                className="flex-none py-0.5 text-xs leading-5 text-gray-500"
              >
                1d ago
              </time>
            </div>
            <p className="text-sm leading-6 text-gray-500">{vote.reason}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
