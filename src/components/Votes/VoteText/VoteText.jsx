export default function VoteText({ support }) {
  const supportText =
    support === "FOR"
      ? "voted for"
      : support === "AGAINST"
        ? "voted against"
        : "abstained";

  return (
    <p
      className={`${support.toLowerCase() === "against" ? "text-[#d62600]" : support.toLowerCase() === "for" ? "text-[#06ab34]" : "text-tertiary"}`}
    >
      {supportText}
    </p>
  );
}
