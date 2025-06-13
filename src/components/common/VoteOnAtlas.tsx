import Link from "next/link";

export const VoteOnAtlas = () => {
  return (
    <div className="rounded-lg border border-line p-1">
      <div className="text-center justify-center">
        <span className="text-secondary text-xs font-bold leading-[18px]">
          Are you a citizen?{" "}
        </span>
        <Link
          href="https://atlas.optimism.io/"
          target="_blank"
          className="text-secondary text-xs font-bold underline leading-[18px]"
        >
          Vote here
        </Link>
      </div>
    </div>
  );
};
