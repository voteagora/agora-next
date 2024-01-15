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

export default async function Page({ params: { addressOrENSName } }) {
  let delegate;
  let delegateVotes;
  let statement;
  let delegatees;
  let delegators;
  try {
    delegate = await fetchDelegate(addressOrENSName);
    delegateVotes = await getDelegateVotes(addressOrENSName);
    statement = await getDelegateStatement(addressOrENSName);
    delegatees = await getDelegatees(addressOrENSName);
    delegators = await getDelegators(addressOrENSName);
  } catch (error) {
    delegate = null;
    delegateVotes = null;
    statement = null;
    delegatees = null;
    delegators = null;
  }

  if (!delegate) {
    return (
      <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
    );
  }

  return (
    <DelegateVotesProvider initialVotes={delegateVotes}>
      <div className="flex flex-col items-center justify-between w-full max-w-full gap-6 mt-12 xl:flex-row xl:items-start">
        <VStack className="static w-full xl:sticky top-16 shrink-0 xl:max-w-xs">
          <DelegateCard
            fetchDelegate={fetchDelegate}
            addressOrENSName={addressOrENSName}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            getProxyAddress={getProxyAddress}
            fetchCurrentDelegatees={getDelegatees}
            fetchDirectDelegatee={fetchDirectDelegatee}
          />
        </VStack>

        <VStack className="flex-1 max-w-full min-w-0 xl:ml-12">
          <DelegateStatementContainer
            addressOrENSName={addressOrENSName}
            statement={statement}
          />
          <DelegationsContainer
            delegatees={delegatees}
            delegators={delegators}
          />

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
        </VStack>
      </div>
    </DelegateVotesProvider>
  );
}
