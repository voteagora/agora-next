import React from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Button } from "@/components/ui/button";
import styles from "../DelegateCardList/DelegateCardList.module.scss";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";

const SelfVotingDelegateCard = ({ address }: { address: string }) => {
  return (
    <div className={styles.link}>
      <VStack gap={4} className={styles.link_container}>
        <VStack gap={4} justifyContent="justify-center">
          <DelegateProfileImage
            address={address}
            votingPower={"0"}
            citizen={true}
          />
          <p className={styles.summary}>
            Want to vote yourself? Delegate your votes to yourself to engage
            directly in Uniswap governance{" "}
          </p>
        </VStack>
        <HStack justifyContent="justify-end">
          <Button
            size="lg"
            className="!px-5 text-base font-semibold !text-white !bg-black !min-w-[179px]"
          >
            I’ll vote myself
          </Button>
        </HStack>
      </VStack>
    </div>
  );
};

export default SelfVotingDelegateCard;
