import { HStack, VStack } from "@/components/Layout/Stack";
import { bpsToString, pluralizeAddresses } from "@/lib/utils";
import { DelegateProfileImage } from "./DelegateProfileImage";
import styles from "./delegateCard.module.scss";
import DelegateCardClient from "./DelegateCardClient";
import { Delegate } from "@/app/api/common/delegates/delegate";

export default function DelegateCard({ delegate }: { delegate: Delegate }) {
  return (
    <VStack className={styles.container}>
      <VStack className={styles.card}>
        <VStack alignItems="items-stretch" className={styles.image}>
          <DelegateProfileImage
            address={delegate.address}
            citizen={delegate.citizen}
            votingPower={delegate.votingPower}
            copyable={true}
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
              detail={pluralizeAddresses(Number(delegate.numOfDelegators))}
            />
            <DelegateCardClient delegate={delegate} />
          </VStack>
        </div>
      </VStack>
    </VStack>
  );
}

export const PanelRow = ({
  title,
  detail,
}: {
  title: string;
  detail: string | JSX.Element;
}) => {
  return (
    <HStack gap={2} className="justify-between items-center">
      <span className="whitespace-nowrap">{title}</span>

      <span className={styles.row}>{detail}</span>
    </HStack>
  );
};
