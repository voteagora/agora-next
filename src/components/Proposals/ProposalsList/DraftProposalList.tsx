import DraftProposalListClient from "./DraftProposalListClient";

// The reason we can't use the same server component pattern is because we need
// the users wallet address to fetch draft proposals they have access to.
// We don't have the user's wallet address until the component mounts.
const DraftProposalList = ({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) => {
  return <DraftProposalListClient />;
};

export default DraftProposalList;
