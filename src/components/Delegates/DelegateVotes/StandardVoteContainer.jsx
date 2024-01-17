import React from "react";
import { pluralizeVote } from "@/lib/tokenUtils";
import styles from "./delegateVotes.module.scss";

function StandardVoteContainer({ support, weight }) {
  return (
    <span
      className={`text-xs font-medium ${
        support.toLowerCase() === "for" && "text-[#06AB34]"
      } ${support.toLowerCase() === "against" && "text-[#D62600]"}`} // todo generalize the colors in tailwind config
    >
      <span className="capitalize">{support.toLowerCase()}</span> with{" "}
      {pluralizeVote(weight, "optimism")}
    </span>
  );
}

export default StandardVoteContainer;
