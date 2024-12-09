export default function VoteText({ support }) {
  const supportText =
    support === "FOR"
      ? "voted for"
      : support === "AGAINST"
        ? "voted against"
        : "abstained";

  return (
    <p
      className={`${support.toLowerCase() === "against" ? "text-negative" : support.toLowerCase() === "for" ? "text-positive" : "text-tertiary"}`}
    >
      {supportText}
    </p>
  );
}
