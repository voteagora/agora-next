/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import DelegateStatement from "@/components/Delegates/DelegateStatement/DelegateStatement";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { getVotesForDelegate } from "@/app/api/votes/getVotes";
import { getStatment } from "@/app/api/statements/getStatements";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
} from "@/app/api/delegations/getDelegations";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";

async function fetchDelegate(addressOrENSName) {
  "use server";

  return getDelegate({ addressOrENSName });
}

async function getDelegateVotes(addressOrENSName, page = 1) {
  "use server";

  return getVotesForDelegate({ addressOrENSName, page });
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
  const delegate = await fetchDelegate(addressOrENSName);
  const delegateVotes = await getDelegateVotes(addressOrENSName);
  const statement = await getDelegateStatement(addressOrENSName);
  const delegatees = await getDelegatees(addressOrENSName);
  const delegators = await getDelegators(addressOrENSName);

  return (
    <HStack
      className={styles.delegate_container}
      justifyContent="justify-between"
      gap={6}
    >
      {delegate && (
        <VStack className={styles.left_container}>
          <DelegateCard delegate={delegate} />
        </VStack>
      )}

      <VStack className={styles.right_container}>
        {!statement && !statement?.delegateStatement && (
          <p>
            This voter has not submitted a statement. Is this you? Connect your
            wallet to verify your address, and tell your community what you’d
            like to see.
          </p>
        )}

        {statement && statement.delegateStatement && (
          <DelegateStatement statement={statement.delegateStatement} />
        )}

        {delegateVotes && (
          <DelegateVotes
            initialVotes={delegateVotes}
            fetchDelegateVotes={async (page) => {
              "use server";

              return getDelegateVotes(addressOrENSName, page);
            }}
          />
        )}
        {delegatees && (
          <DelegationsContainer
            delegatees={delegatees}
            delegators={delegators}
          />
        )}
      </VStack>
    </HStack>
  );
}
