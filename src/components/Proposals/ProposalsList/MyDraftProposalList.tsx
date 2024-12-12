import MyDraftProposalListClient from "./MyDraftProposalListClient";

const MyDraftProposalList = ({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) => {
  return <MyDraftProposalListClient />;
};

export default MyDraftProposalList;
