/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import AgoraAPI from "@/app/lib/agoraAPI";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import DelegateStatement from "@/components/Delegates/DelegateStatement/DelegateStatement";

async function getDelegate(addressOrENSName) {
  "use server";
  const api = new AgoraAPI();
  const data = await api.get(`/delegates/${addressOrENSName}`);
  return data.delegate;
}

async function getDelegateVotes(addressOrENSName, page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(
    `/delegates/${addressOrENSName}/votes?page=${page}`
  );
  return { delegateVotes: data.votes, meta: data.meta };
}

async function getDelegateStatement(addressOrENSName) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/delegates/${addressOrENSName}/statement`);
  return data.statement;
}

export default async function Page({ params: { addressOrENSName } }) {
  const delegate = await getDelegate(addressOrENSName);
  const delegateVotes = await getDelegateVotes(addressOrENSName);
  const statement = await getDelegateStatement(addressOrENSName);

  return (
    <HStack
      className={styles.delegate_container}
      justifyContent="justify-between"
      gap={6}
    >
      <VStack className={styles.left_container}>
        <DelegateCard delegate={delegate} />
      </VStack>

      <VStack className={styles.right_container}>
        {!statement.delegateStatement && (
          <p>
            This voter has not submitted a statement. Is this you? Connect your
            wallet to verify your address, and tell your community what you’d
            like to see.
          </p>
        )}

        {statement.delegateStatement && (
          <DelegateStatement
            statement={statement.delegateStatement}
          />
        )}

        <DelegateVotes
          initialVotes={delegateVotes}
          fetchDelegateVotes={getDelegateVotes}
        />
      </VStack>
    </HStack>
  );
}
