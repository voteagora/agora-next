import React from "react";

type VoteType = "FOR" | "AGAINST" | "ABSTAIN";

interface HumanVoteProps {
  support: VoteType;
}

const HumanVote: React.FC<HumanVoteProps> = ({ support }) => {
  let color: string;
  switch (support) {
    case "FOR":
      color = "green";
      break;
    case "AGAINST":
      color = "red";
      break;
    case "ABSTAIN":
      color = "black";
      break;
    default:
      color = "black";
  }
  return <span style={{ color }}>{support.toLowerCase()}</span>;
};

export default HumanVote;