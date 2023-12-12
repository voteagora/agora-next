/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import DelegatesVotesSort from "@/components/Delegates/DelegateVotes/DelegatesVotesSort";
import DelegatesVotesType from "@/components/Delegates/DelegateVotes/DelegatesVotesType";
import { VStack } from "@/components/Layout/Stack";
import DelegateStatement from "@/components/Delegates/DelegateStatement/DelegateStatement";
import { getVotesForDelegate } from "@/app/api/votes/getVotes";
import { getStatment } from "@/app/api/statements/getStatements";
import DelegateVotesProvider from "@/contexts/DelegateVotesContext";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
} from "@/app/api/delegations/getDelegations";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { getDelegate } from "@/app/api/delegates/getDelegates";

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
      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6 justify-between mt-8 xl:m-8 xl:px-4 w-full max-w-6xl">
        <VStack className="static xl:sticky top-16 shrink-0 w-full xl:max-w-xs">
          <DelegateCard addressOrENSName={addressOrENSName} />
        </VStack>

        <VStack className="xl:ml-12 min-w-0 flex-1">
          {!statement && !statement?.delegateStatement && (
            <p>
              This voter has not submitted a statement. Is this you? Connect
              your wallet to verify your address, and tell your community what
              you’d like to see.
            </p>
          )}

          {statement && statement.delegateStatement && (
            <DelegateStatement statement={statement.delegateStatement} />
          )}

          {delegateVotes && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between gap-2">
                <h2 className="text-2xl font-bold">Past Votes</h2>
                <div className="flex flex-col md:flex-row justify-between gap-2">
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
                </div>
              </div>
              <DelegateVotes
                fetchDelegateVotes={async (page, sortOrder) => {
                  "use server";

                  return getDelegateVotes(addressOrENSName, page, sortOrder);
                }}
              />
            </div>
          )}

          <DelegationsContainer
            delegatees={delegatees}
            delegators={delegators}
          />
        </VStack>
      </div>
    </DelegateVotesProvider>
  );
}
