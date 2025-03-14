import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { fetchDelegateForSCW } from "@/app/api/common/delegates/getDelegateForSCW";
import { fetchDelegate } from "@/app/delegates/actions";

import { formatNumber } from "@/lib/tokenUtils";
import {
  ensNameToAddress,
  processAddressOrEnsName,
  resolveENSTextRecords,
  resolveEFPStats,
} from "@/app/lib/ENSUtils";
import Tenant from "@/lib/tenant/tenant";
import { redirect } from "next/navigation";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DelegateStatementWrapper from "@/components/Delegates/DelegateStatement/DelegateStatementWrapper";
import DelegationsContainerWrapper from "@/components/Delegates/Delegations/DelegationsContainerWrapper";
import VotesContainerWrapper from "@/components/Delegates/DelegateVotes/VotesContainerWrapper";

export const dynamic = "force-dynamic";
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
}: {
  params: { addressOrENSName: string };
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

  const [delegate, textRecords, efpStats] = await Promise.all([
    fetchDelegate(address),
    ui.toggle("show-ens-text-records")?.enabled
      ? resolveENSTextRecords(address, ["description", "location"])
      : null,
    ui.toggle("show-efp-stats")?.enabled ? resolveEFPStats(address) : null,
  ]);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <div className="flex flex-col static sm:sticky top-16 shrink-0 w-full sm:max-w-[350px]">
        <DelegateCard
          delegate={delegate}
          description={textRecords?.description}
          location={textRecords?.location}
          followersCount={efpStats?.followers_count}
          followingCount={efpStats?.following_count}
        />
      </div>
      {!scwDelegate ? (
        <div className="flex flex-col sm:ml-12 min-w-0 flex-1 max-w-full">
          <Tabs defaultValue={"statement"} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="statement" variant="underlined">
                My Statement
              </TabsTrigger>
              <TabsTrigger value="participation" variant="underlined">
                My Participation
              </TabsTrigger>
              <TabsTrigger value="delegations" variant="underlined">
                Delegations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="statement">
              <DelegateStatementWrapper delegate={delegate} />
            </TabsContent>
            <TabsContent value="participation">
              <VotesContainerWrapper delegate={delegate} />
            </TabsContent>
            <TabsContent value="delegations">
              <DelegationsContainerWrapper delegate={delegate} />
            </TabsContent>
          </Tabs>{" "}
        </div>
      ) : (
        <DelegateStatementWrapper delegate={delegate} />
      )}
    </div>
  );
}
