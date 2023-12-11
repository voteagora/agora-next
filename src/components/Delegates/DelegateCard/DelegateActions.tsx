"use client";

import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { useAccount } from "wagmi";
import { useState } from "react";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { Delegation } from "@/app/api/delegations/delegation";

export function DelegateActions({
  delegate,
  className,
  discord,
  twitter,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}: {
  delegate: string;
  className?: string;
  discord?: string;
  twitter?: string;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<Delegation[]>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
}) {
  const { address } = useAccount();
  // TODO: Check if user's balance is above the minimum
  const [isPowerUser, setIsPowerUser] = useState(true);

  return (
    <HStack
      alignItems="items-stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks discord={discord} twitter={twitter} />
      {address &&
        (isPowerUser ? (
          <AdvancedDelegateButton
            delegate={delegate}
            fetchVotingPowerForSubdelegation={() =>
              fetchVotingPowerForSubdelegation(address)
            }
            checkIfDelegatingToProxy={() => checkIfDelegatingToProxy(address)}
            fetchCurrentDelegatees={() => fetchCurrentDelegatees(address)}
            getProxyAddress={() => getProxyAddress(address)}
          />
        ) : (
          <DelegateButton
            full={!twitter && !discord}
            delegate={delegate}
            fetchBalanceForDirectDelegation={() =>
              fetchBalanceForDirectDelegation(address)
            }
          />
        ))}
    </HStack>
  );
}
