import Link from "next/link";

const ATLAS_URL =
  process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
    ? "https://atlas.optimism.io/"
    : "https://op-atlas-fx6v5dqp9-voteagora.vercel.app/";

export const VoteOnAtlas = ({
  offchainProposalId,
}: {
  offchainProposalId?: string;
}) => {
  return (
    <div className="rounded-lg border border-line p-1">
      <div className="text-center justify-center">
        <span className="text-secondary text-xs font-bold leading-[18px]">
          Are you a citizen?{" "}
        </span>
        <Link
          href={`${ATLAS_URL}proposals/${offchainProposalId}`}
          target="_blank"
          className="text-secondary text-xs font-bold underline leading-[18px]"
        >
          Vote here
        </Link>
      </div>
    </div>
  );
};
