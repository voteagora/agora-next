import ENSName from "@/components/shared/ENSName";

export default function ForumAuthorName({
  address,
  displayName,
  isDeleted = false,
}: {
  address?: string | null;
  displayName?: string | null;
  isDeleted?: boolean;
}) {
  if (isDeleted) {
    return <span className="text-primary">Removed account</span>;
  }

  const trimmed = displayName?.trim();
  if (trimmed) {
    return <span className="text-primary">{trimmed}</span>;
  }

  if (!address) {
    return <span className="text-primary">Someone in the community</span>;
  }

  return <ENSName address={address} />;
}
