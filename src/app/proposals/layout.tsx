import SafeProposalPublishBanner from "@/components/Proposals/SafeProposalPublishBanner";

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SafeProposalPublishBanner />
      {children}
    </>
  );
}
