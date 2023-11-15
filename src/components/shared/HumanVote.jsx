import React from "react";

const HumanVote = ({ support }) => {
  let color;
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
