/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import { VStack } from "@/components/Layout/Stack";
import { VotesSortOrder } from "@/app/api/common/votes/vote";
import DelegateVotesProvider from "@/contexts/DelegateVotesContext";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementContainer from "@/components/Delegates/DelegateStatement/DelegateStatementContainer";
import TopIssues from "@/components/Delegates/DelegateStatement/TopIssues";
import {
  fetchCurrentDelegatees,
  fetchCurrentDelegators,
  fetchDelegate,
  fetchDelegateStatement,
  fetchVotesForDelegate,
} from "@/app/delegates/actions";
import { formatNumber } from "@/lib/tokenUtils";
import { truncateAddress, truncateString } from "@/app/lib/utils/text";
import { isAddress } from "viem";

export async function generateMetadata(
  { params }: { params: any },
  parent: any,
) {

  const [delegate, delegateStatement] = await Promise.all([
    fetchDelegate(params.addressOrENSName),
    fetchDelegateStatement(params.addressOrENSName),
  ]);

  const description = encodeURIComponent("Optimism Voter");
  const address = encodeURIComponent(isAddress(params.addressOrENSName) ? truncateAddress(params.addressOrENSName) : params.addressOrENSName);

  const statement = (delegateStatement?.payload as { delegateStatement: string })?.delegateStatement;
  const truncatedStatement = statement ? encodeURIComponent(truncateString(statement, 220)) : "";
  const votes = encodeURIComponent(`${formatNumber(delegate.votingPower)} OP`);

  const preview = `/api/images/og/delegate?address=${address}&description=${description}&statement=${truncatedStatement}&votes=${votes}`;

  return {
    title: `${address} on Agora`,
    description: `See what ${address} believes and how they vote on Optimism governance.`,
    openGraph: {
      images: [preview],
    },
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: preview,
    },
  };
}

export default async function Page({
                                     params: { addressOrENSName },
                                   }: {
  params: { addressOrENSName: string };
}) {
  const [delegate, delegateVotes, statement, delegatees, delegators] =
    await Promise.all([
      fetchDelegate(addressOrENSName),
      fetchVotesForDelegate(addressOrENSName),
      fetchDelegateStatement(addressOrENSName),
      fetchCurrentDelegatees(addressOrENSName),
      fetchCurrentDelegators(addressOrENSName),
    ]);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div
      className="flex flex-col xl:flex-row items-center xl:items-start gap-6 justify-between mt-12 w-full max-w-full">
      <VStack className="static xl:sticky top-16 shrink-0 w-full xl:max-w-xs">
        <DelegateCard delegate={delegate} />
      </VStack>

      <VStack className="xl:ml-12 min-w-0 flex-1 max-w-full gap-8">
        <DelegateStatementContainer
          addressOrENSName={addressOrENSName}
          statement={statement}
        />
        {statement && <TopIssues statement={statement} />}
        <DelegationsContainer delegatees={delegatees} delegators={delegators} />

        {/* TODO: -> this could be refactor with revalidatePath */}
        <DelegateVotesProvider initialVotes={delegateVotes}>
          {delegateVotes && delegateVotes.votes.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <h2 className="text-2xl font-bold">Past Votes</h2>
                {/* <div className="flex flex-col justify-between gap-2 md:flex-row">
                  <DelegatesVotesSort
                    fetchDelegateVotes={async (page, sortOrder) => {
                      "use server";

                      return getDelegateVotes(
                        addressOrENSName,
                        page,
                        sortOrder
                      );
                    }}
                  />
                  <DelegatesVotesType />
                </div> */}
              </div>
              <DelegateVotes
                fetchDelegateVotes={async (
                  page: number,
                  sortOrder: VotesSortOrder,
                ) => {
                  "use server";

                  return fetchVotesForDelegate(
                    addressOrENSName,
                    page,
                    sortOrder,
                  );
                }}
              />
            </div>
          ) : (
            <div className="default-message-class">
              <p>No past votes available.</p>
            </div>
          )}
        </DelegateVotesProvider>
      </VStack>
    </div>
  );
}
