import styles from "./voteText.module.scss";

export default function VoteText({ support }) {
  const className = `${styles["vote_" + support.toLowerCase()]}`;
  const supportText =
    support === "FOR"
      ? "voted for"
      : support === "AGAINST"
        ? "voted against"
        : "abstained";

  return <p className={className}>{supportText}</p>;
}
