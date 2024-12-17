import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { fetchDelegate } from "@/app/delegates/actions";
import {
  fetchProposals,
  fetchProposalsCount,
} from "@/app/api/common/proposals/getProposals";
import { formatNumber } from "@/lib/tokenUtils";
import {
  processAddressOrEnsName,
  resolveENSName,
  resolveENSProfileImage,
} from "@/app/lib/ENSUtils";
import Tenant from "@/lib/tenant/tenant";
import { Suspense } from "react";
import DelegateStatementWrapper, {
  DelegateStatementSkeleton,
} from "@/components/Delegates/DelegateStatement/DelegateStatementWrapper";
import DelegationsContainerWrapper, {
  DelegationsContainerSkeleton,
} from "@/components/Delegates/Delegations/DelegationsContainerWrapper";
import VotesContainerWrapper, {
  VotesContainerSkeleton,
} from "@/components/Delegates/DelegateVotes/VotesContainerWrapper";
import { fetchDelegateForSCW } from "@/app/api/common/delegates/getDelegateForSCW";

export async function generateMetadata(
  { params }: { params: { addressOrENSName: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // cache ENS address upfront for all subsequent queries
  // TODO: change subqueries to use react cache
  const address = await resolveENSName(params.addressOrENSName);
  const ensOrTruncatedAddress = await processAddressOrEnsName(
    params.addressOrENSName
  );
  const [delegate, avatar] = await Promise.all([
    fetchDelegate(address || params.addressOrENSName),
    resolveENSProfileImage(address || params.addressOrENSName),
  ]);

  const { token } = Tenant.current();

  const statement = (
    delegate.statement?.payload as { delegateStatement: string }
  )?.delegateStatement;

  const imgParams = [
    delegate.votingPower &&
      `votes=${encodeURIComponent(
        `${formatNumber(delegate.votingPower.total || "0")} ${token.symbol}`
      )}`,
    avatar && `avatar=${encodeURIComponent(avatar)}`,
    statement && `statement=${encodeURIComponent(statement)}`,
  ].filter(Boolean);

  const preview = `/api/images/og/delegate?${imgParams.join(
    "&"
  )}&address=${ensOrTruncatedAddress}`;
  const title = `${ensOrTruncatedAddress} on Agora`;
  const description = `See what ${ensOrTruncatedAddress} believes and how they vote on ${token.name} governance.`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({
  params: { addressOrENSName },
}: {
  params: { addressOrENSName: string };
}) {
  const address = (await resolveENSName(addressOrENSName)) || addressOrENSName;

  const [delegate, scwOwner, totalProposals] = await Promise.all([
    fetchDelegate(address),
    fetchDelegateForSCW(address),
    fetchProposalsCount(),
  ]);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <div className="flex flex-col static sm:sticky top-16 shrink-0 w-full sm:max-w-xs">
        <DelegateCard delegate={delegate} totalProposals={totalProposals} />
      </div>
      <div className="flex flex-col sm:ml-12 min-w-0 flex-1 max-w-full gap-8">
        <Suspense fallback={<DelegateStatementSkeleton />}>
          <DelegateStatementWrapper addressOrENSName={addressOrENSName} />
        </Suspense>
        <Suspense fallback={<DelegationsContainerSkeleton />}>
          <DelegationsContainerWrapper addressOrENSName={addressOrENSName} />
        </Suspense>
        <Suspense fallback={<VotesContainerSkeleton />}>
          <VotesContainerWrapper addressOrENSName={addressOrENSName} />
        </Suspense>
      </div>
    </div>
  );
}
