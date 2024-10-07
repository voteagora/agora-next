/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */
import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementContainer from "@/components/Delegates/DelegateStatement/DelegateStatementContainer";
import TopIssues from "@/components/Delegates/DelegateStatement/TopIssues";
import {
  fetchCurrentDelegatees,
  fetchCurrentDelegators,
  fetchDelegate,
  fetchVotesForDelegate,
} from "@/app/delegates/actions";
import { fetchSnapshotVotesForDelegate } from "@/app/api/common/votes/getVotes";
import { formatNumber } from "@/lib/tokenUtils";
import {
  processAddressOrEnsName,
  resolveENSName,
  resolveENSProfileImage,
} from "@/app/lib/ENSUtils";
import Tenant from "@/lib/tenant/tenant";
import TopStakeholders from "@/components/Delegates/DelegateStatement/TopStakeholders";
import SnapshotVotes from "@/components/Delegates/DelegateVotes/SnapshotVotes";
import VotesContainer from "@/components/Delegates/DelegateVotes/VotesContainer";
import { PaginationParams } from "@/app/lib/pagination";

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
  const [delegate, delegateVotes, delegates, delegators, snapshotVotes] =
    await Promise.all([
      fetchDelegate(address),
      fetchVotesForDelegate(address),
      fetchCurrentDelegatees(address),
      fetchCurrentDelegators(address),
      fetchSnapshotVotesForDelegate({ addressOrENSName: address }),
    ]);

  const statement = delegate.statement;

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <div className="flex flex-col static sm:sticky top-16 shrink-0 w-full sm:max-w-xs">
        <DelegateCard delegate={delegate} />
      </div>

      <div className="flex flex-col sm:ml-12 min-w-0 flex-1 max-w-full gap-8">
        <DelegateStatementContainer
          addressOrENSName={addressOrENSName}
          statement={statement}
        />

        {statement && (
          <>
            <TopIssues statement={statement} />
            <TopStakeholders statement={statement} />
          </>
        )}

        <DelegationsContainer
          delegatees={delegates}
          initialDelegators={delegators}
          fetchDelegators={async (pagination: PaginationParams) => {
            "use server";

            return fetchCurrentDelegators(addressOrENSName, pagination);
          }}
        />
        <VotesContainer
          onchainVotes={
            <>
              {delegateVotes && delegateVotes.data.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <DelegateVotes
                    initialVotes={delegateVotes}
                    fetchDelegateVotes={async (
                      pagination: PaginationParams
                    ) => {
                      "use server";
                      return fetchVotesForDelegate(
                        addressOrENSName,
                        pagination
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
                  No past votes available.
                </div>
              )}
            </>
          }
          snapshotVotes={
            <>
              {snapshotVotes && snapshotVotes.data.length > 0 ? (
                <SnapshotVotes
                  initialVotes={snapshotVotes}
                  fetchSnapshotVotes={async (pagination: PaginationParams) => {
                    "use server";
                    return await fetchSnapshotVotesForDelegate({
                      addressOrENSName: addressOrENSName,
                      pagination,
                    });
                  }}
                />
              ) : (
                <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
                  No past votes available.
                </div>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
