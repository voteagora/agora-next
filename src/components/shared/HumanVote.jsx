import React from "react";

const HumanVote = ({ support }) => {
  let output;
  let color;
  switch (support) {
    case 1:
      output = "for";
      color = "green";
      break;
    case -1:
      output = "against";
      color = "red";
      break;
    case 0:
      output = "abstain";
      color = "black";
      break;
    default:
      output = "Invalid input";
      color = "black";
  }
  return <span style={{ color }}>{output}</span>;
};

export default HumanVote;
