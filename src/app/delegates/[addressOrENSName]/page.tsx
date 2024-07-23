/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */
import { Metadata, ResolvingMetadata } from "next";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import DelegateVotesProvider from "@/contexts/DelegateVotesContext";
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
import { getSnapshotVotesForDelegate } from "@/app/api/common/votes/getVotes";
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
  const { ui } = Tenant.current();
  const tenantSupportsSnapshotVote = ui.toggle("snapshotVotes") || false;

  const address = (await resolveENSName(addressOrENSName)) || addressOrENSName;
  const [delegate, delegateVotes, delegates, delegators, snapshotVotes] =
    await Promise.all([
      fetchDelegate(address),
      fetchVotesForDelegate(address),
      fetchCurrentDelegatees(address),
      fetchCurrentDelegators(address),
      tenantSupportsSnapshotVote
        ? getSnapshotVotesForDelegate({ addressOrENSName: address, page: 1 })
        : Promise.resolve({ meta: { total: 0 }, votes: [] }),
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
          fetchDelegators={async (pagination: {
            offset: number;
            limit: number;
          }) => {
            "use server";

            return fetchCurrentDelegators(addressOrENSName, pagination);
          }}
        />
        {tenantSupportsSnapshotVote ? (
          <VotesContainer
            onchainVotes={
              <DelegateVotesProvider initialVotes={delegateVotes}>
                {delegateVotes && delegateVotes.votes.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <DelegateVotes
                      fetchDelegateVotes={async (page: number) => {
                        "use server";
                        return fetchVotesForDelegate(addressOrENSName, page);
                      }}
                    />
                  </div>
                ) : (
                  <div className="default-message-class">
                    <p>No past votes available.</p>
                  </div>
                )}
              </DelegateVotesProvider>
            }
            snapshotVotes={
              <>
                {snapshotVotes && snapshotVotes.votes.length > 0 ? (
                  <SnapshotVotes
                    meta={snapshotVotes.meta}
                    initialVotes={snapshotVotes.votes}
                    fetchSnapshotVotes={async (page: number) => {
                      "use server";
                      return await getSnapshotVotesForDelegate({
                        addressOrENSName: addressOrENSName,
                        page: page,
                      });
                    }}
                  />
                ) : (
                  <div className="default-message-class">
                    <p>No past votes available.</p>
                  </div>
                )}
              </>
            }
          />
        ) : (
          <DelegateVotesProvider initialVotes={delegateVotes}>
            {delegateVotes && delegateVotes.votes.length > 0 ? (
              <div className="flex flex-col gap-4">
                <DelegateVotes
                  fetchDelegateVotes={async (page: number) => {
                    "use server";
                    return fetchVotesForDelegate(addressOrENSName, page);
                  }}
                />
              </div>
            ) : (
              <div className="default-message-class">
                <p>No past votes available.</p>
              </div>
            )}
          </DelegateVotesProvider>
        )}
      </div>
    </div>
  );
}
