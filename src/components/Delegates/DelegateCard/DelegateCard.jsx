import { HStack, VStack } from "@/components/Layout/Stack";
import { bpsToString, pluralizeAddresses } from "@/lib/utils";
import { DelegateProfileImage } from "./DelegateProfileImage";
import styles from "./delegateCard.module.scss";
import DelegateCardClient from "./DelegateCardClient";

export default async function DelegateCard({
  addressOrENSName,
  fetchDelegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}) {
  const delegate = await fetchDelegate(addressOrENSName);

  if (!delegate) {
    return null;
  }

  return (
    <VStack className={styles.container}>
      <VStack className={styles.card}>
        <VStack alignItems="stretch" className={styles.image}>
          <DelegateProfileImage
            address={delegate.address}
            votingPower={delegate.votingPower}
          />
        </VStack>

        <div className={styles.content}>
          <VStack gap={4}>
            <PanelRow
              title="Proposals Voted"
              detail={
                !delegate.proposalsVotedOn
                  ? "N/A"
                  : `${delegate.proposalsVotedOn} (${bpsToString(
                      delegate.votingParticipation * 100
                    )})`
              }
            />
            <PanelRow
              title="For / Against / Abstain"
              detail={`${delegate.votedFor} / ${delegate.votedAgainst} / ${delegate.votedAbstain}`}
            />
            {/* <PanelRow
              title="Vote Power"
              detail={
                <>
                  {bpsToString(
                    delegate.votingPowerRelativeToVotableSupply * 100
                  )}{" "}
                  votable supply
                  <br />
                  {bpsToString(delegate.votingPowerRelativeToQuorum * 100)}{" "}
                  quorum
                </>
              }
            /> */}
            <PanelRow
              title="Recent activity"
              detail={
                delegate.lastTenProps
                  ? `${delegate.lastTenProps} of 10 last props`
                  : "N/A"
              }
            />
            <PanelRow
              title="Proposals created"
              detail={`${delegate.proposalsCreated}`}
            />
            <PanelRow
              title="Delegated from"
              detail={pluralizeAddresses(delegate.numOfDelegators)}
            />

            <DelegateCardClient
              delegate={delegate}
              fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
              fetchVotingPowerForSubdelegation={
                fetchVotingPowerForSubdelegation
              }
              checkIfDelegatingToProxy={checkIfDelegatingToProxy}
              fetchCurrentDelegatees={fetchCurrentDelegatees}
              getProxyAddress={getProxyAddress}
            />
          </VStack>
        </div>
      </VStack>
    </VStack>
  );
}

export const PanelRow = ({ title, detail }) => {
  return (
    <HStack gap="2" justifyContent="justify-between" alignItems="baseline">
      <span className="whitespace-nowrap">{title}</span>

      <span className={styles.row}>{detail}</span>
    </HStack>
  );
};
