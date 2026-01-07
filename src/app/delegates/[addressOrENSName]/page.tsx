import { Suspense } from "react";

import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { fetchDelegateForSCW } from "@/app/api/common/delegates/getDelegateForSCW";
import { fetchDelegate } from "@/app/delegates/actions";
import { fetchBadgesForDelegate } from "@/app/api/common/badges/getBadges";

import { formatNumber } from "@/lib/tokenUtils";
import {
  ensNameToAddress,
  processAddressOrEnsName,
  resolveENSTextRecords,
  resolveEFPStats,
} from "@/app/lib/ENSUtils";
import Tenant from "@/lib/tenant/tenant";
import { redirect } from "next/navigation";

import DelegateStatementWrapper from "@/components/Delegates/DelegateStatement/DelegateStatementWrapper";
import DelegationsContainerWrapper, {
  DelegationsContainerSkeleton,
} from "@/components/Delegates/Delegations/DelegationsContainerWrapper";
import VotesContainerWrapper, {
  VotesContainerSkeleton,
} from "@/components/Delegates/DelegateVotes/VotesContainerWrapper";
import DiscussionsContainerWrapper, {
  DiscussionsContainerSkeleton,
} from "@/components/Delegates/Discussions/DiscussionsContainerWrapper";
import { DelegateStatement } from "@/app/api/common/delegates/delegate";

export const dynamic = "force-dynamic"; // needed for both app and e2e
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: { addressOrENSName: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // cache ENS address upfront for all subsequent queries
  // TODO: change subqueries to use react cache
  const [address, ensOrTruncatedAddress] = await Promise.all([
    ensNameToAddress(params.addressOrENSName),
    processAddressOrEnsName(params.addressOrENSName),
  ]);

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
  searchParams,
}: {
  params: { addressOrENSName: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const address = await ensNameToAddress(addressOrENSName);

  // Check if this is a SCW address
  const scwConfig = ui.smartAccountConfig;
  const scwDelegate = scwConfig ? await fetchDelegateForSCW(address) : null;

  // If it's a SCW address, redirect to the owner's delegate page
  if (scwDelegate) {
    return redirect(`/delegates/${scwDelegate.address}`);
  }

  const [delegate, textRecords, efpStats, badges] = await Promise.all([
    fetchDelegate(address),
    ui.toggle("show-ens-text-records")?.enabled
      ? resolveENSTextRecords(address, ["description", "location"])
      : null,
    ui.toggle("show-efp-stats")?.enabled ? resolveEFPStats(address) : null,
    ui.toggle("show-delegate-badges")?.enabled
      ? fetchBadgesForDelegate(address)
      : null,
  ]);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  const parsedDelegate = Object.assign({}, delegate, {
    statement: delegate.statement
      ? ({
          ...delegate.statement,
          email: null,
        } as DelegateStatement)
      : null,
  });

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <div className="flex flex-col static md:sticky top-16 shrink-0 w-full md:max-w-[330px] lg:max-w-[350px]">
        <DelegateCard
          delegate={parsedDelegate}
          description={textRecords?.description}
          location={textRecords?.location}
          followersCount={efpStats?.followers_count}
          followingCount={efpStats?.following_count}
          badges={badges}
        />
      </div>
      {!scwDelegate ? (
        <div className="flex flex-col md:ml-8 lg:ml-12 min-w-0 flex-1 max-w-full gap-8">
          <DelegateStatementWrapper delegate={parsedDelegate} />

          <Suspense fallback={<VotesContainerSkeleton />}>
            <VotesContainerWrapper delegate={parsedDelegate} />
          </Suspense>

          <Suspense fallback={<DelegationsContainerSkeleton />}>
            <DelegationsContainerWrapper delegate={parsedDelegate} />
          </Suspense>
          {ui.toggle("forums")?.enabled && (
            <Suspense fallback={<DiscussionsContainerSkeleton />}>
              <DiscussionsContainerWrapper delegate={parsedDelegate} />
            </Suspense>
          )}
        </div>
      ) : (
        <DelegateStatementWrapper delegate={parsedDelegate} />
      )}
    </div>
  );
}
