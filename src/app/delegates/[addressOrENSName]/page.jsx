/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import DelegatesVotesSort from "@/components/Delegates/DelegateVotes/DelegatesVotesSort";
import DelegatesVotesType from "@/components/Delegates/DelegateVotes/DelegatesVotesType";
import { VStack } from "@/components/Layout/Stack";
import { getVotesForDelegate } from "@/app/api/votes/getVotes";
import { getStatment } from "@/app/api/statements/getStatements";
import DelegateVotesProvider from "@/contexts/DelegateVotesContext";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
  getDirectDelegatee,
} from "@/app/api/delegations/getDelegations";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import DelegateStatementContainer from "@/components/Delegates/DelegateStatement/DelegateStatementContainer";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";

async function fetchDelegate(addressOrENSName) {
  "use server";

  return getDelegate({ addressOrENSName });
}

async function getDelegateVotes(addressOrENSName, page = 1, sortOrder) {
  "use server";

  return getVotesForDelegate({ addressOrENSName, page, sortOrder });
}

async function getDelegateStatement(addressOrENSName) {
  "use server";

  return getStatment({ addressOrENSName });
}

async function getDelegatees(addressOrENSName) {
  "use server";

  return getCurrentDelegatees({ addressOrENSName });
}

async function getDelegators(addressOrENSName) {
  "use server";

  return getCurrentDelegators({ addressOrENSName });
}

async function fetchVotingPowerForSubdelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

async function checkIfDelegatingToProxy(addressOrENSName) {
  "use server";

  return isDelegatingToProxy({ addressOrENSName });
}

async function fetchBalanceForDirectDelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

async function getProxyAddress(addressOrENSName) {
  "use server";

  return getProxy({ addressOrENSName });
}

async function fetchDirectDelegatee(addressOrENSName) {
  "use server";

  return getDirectDelegatee({ addressOrENSName });
}

export async function generateMetadata({ params }, parent) {
  return {
    title: `Agora - OP Voter`,
    description: `See what ${params.addressOrENSName} believes and how they vote on Optimism governance.`,
  };
}

export default async function Page({ params: { addressOrENSName } }) {
  const [delegate, delegateVotes, statement, delegatees, delegators] =
    await Promise.all([
      fetchDelegate(addressOrENSName),
      getDelegateVotes(addressOrENSName),
      getDelegateStatement(addressOrENSName),
      getDelegatees(addressOrENSName),
      getDelegators(addressOrENSName),
    ]);

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-full gap-6 mt-12 xl:flex-row xl:items-start">
      {delegate && (
        <VStack className="static w-full xl:sticky top-16 shrink-0 xl:max-w-xs">
          <DelegateCard
            delegate={delegate}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            getProxyAddress={getProxyAddress}
            fetchCurrentDelegatees={getDelegatees}
            fetchDirectDelegatee={fetchDirectDelegatee}
            getDelegators={getDelegators}
          />
        </VStack>
      )}

      <VStack className="flex-1 max-w-full min-w-0 xl:ml-12">
        <DelegateStatementContainer
          addressOrENSName={addressOrENSName}
          statement={statement}
        />
        <DelegationsContainer delegatees={delegatees} delegators={delegators} />
        <DelegateVotesProvider initialVotes={delegateVotes}>
          {delegateVotes.votes.length > 0 ? (
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
                fetchDelegateVotes={async (page, sortOrder) => {
                  "use server";

                  return getDelegateVotes(addressOrENSName, page, sortOrder);
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
