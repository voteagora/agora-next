import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { fetchDelegate } from "@/app/delegates/actions";
import { formatNumber } from "@/lib/tokenUtils";
import {
  ensNameToAddress,
  processAddressOrEnsName,
  resolveENSTextRecords,
  resolveEFPStats,
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
import { SCWRedirect } from "@/app/delegates/[addressOrENSName]/components/SCWRedirect";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: { addressOrENSName: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // cache ENS address upfront for all subsequent queries
  // TODO: change subqueries to use react cache
  const address = await ensNameToAddress(params.addressOrENSName);
  const ensOrTruncatedAddress = await processAddressOrEnsName(
    params.addressOrENSName
  );
  const delegate = await fetchDelegate(address);

  const { token } = Tenant.current();

  const statement = (
    delegate.statement?.payload as { delegateStatement: string }
  )?.delegateStatement;

  const imgParams = [
    delegate.votingPower &&
      `votes=${encodeURIComponent(
        `${formatNumber(delegate.votingPower.total || "0")} ${token.symbol}`
      )}`,
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
  const address = await ensNameToAddress(addressOrENSName);
  const delegate = await fetchDelegate(address);
  const textRecords = await resolveENSTextRecords(address, [
    "description",
    "location",
  ]);
  const efpStats = await resolveEFPStats(address);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <div className="flex flex-col static sm:sticky top-16 shrink-0 w-full sm:max-w-xs">
        <DelegateCard
          delegate={delegate}
          description={textRecords?.description}
          location={textRecords?.location}
          followersCount={efpStats?.followers_count}
          followingCount={efpStats?.following_count}
        />
      </div>
      <div className="flex flex-col sm:ml-12 min-w-0 flex-1 max-w-full gap-8">
        <SCWRedirect address={address} />
        <Suspense fallback={<DelegateStatementSkeleton />}>
          <DelegateStatementWrapper delegate={delegate} />
        </Suspense>
        <Suspense fallback={<DelegationsContainerSkeleton />}>
          <DelegationsContainerWrapper delegate={delegate} />
        </Suspense>
        <Suspense fallback={<VotesContainerSkeleton />}>
          <VotesContainerWrapper delegate={delegate} />
        </Suspense>
      </div>
    </div>
  );
}
