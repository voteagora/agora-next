"use client";

import Image from "next/image";
import HumanAddress from "../shared/HumanAddress";
import styles from "./styles.module.scss";
import { HStack, VStack } from "../Layout/Stack";
import ENSAvatar from "../shared/ENSAvatar";

export default function DelegateCard({ delegate }) {
  console.log(delegate);
  if (!delegate) {
    return null;
  }
  return (
    <VStack key={delegate.address} className={styles.delegate_card}>
      <HStack className={styles.delegate_card__header} gap="4">
        <ENSAvatar address={delegate.address} />
        <VStack gap="2">
          <HumanAddress address={delegate.address} />
          <p className="text-sm font-medium text-gray-900">
            {delegate.votingPower}
          </p>
        </VStack>
      </HStack>
      <div className="min-w-0 flex-1">
        <span className="absolute inset-0" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-900">
          <HumanAddress address={delegate.address} />
        </p>
        <p className="text-sm font-medium text-gray-900">
          Voting power: {delegate.votingPower}
        </p>
        <p className="text-sm font-medium text-gray-900">
          Proposals voted: {delegate.proposalsVotedOn} (
          {delegate.votingParticipation * 100}%)
        </p>
        <p className="text-sm font-medium text-gray-900">
          For / Againts / Abstain: {delegate.votedFor} / {delegate.votedAgainst}{" "}
          / {delegate.votedAbstain}
        </p>
        <p className="text-sm font-medium text-gray-900">
          Voting Power: {delegate.votingPowerRelativeToVotableSupply * 100}%
          votable supply {delegate.votingPowerRelativeToQuorum * 100}% quorum
        </p>
        <p className="text-sm font-medium text-gray-900">
          Recent Activity: {delegate.lastTenProps} of 10 last props
        </p>
        <p className="text-sm font-medium text-gray-900">
          Proposals Created: {delegate.proposalsCreated}
        </p>
        <p className="text-sm font-medium text-gray-900">
          Delegated From: {delegate.numOfDelegators}
        </p>
      </div>
    </VStack>
  );
}
