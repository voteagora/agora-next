import { useAccount, useBalance, useContractWrite, useEnsName } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { HStack, VStack } from "@/components/Layout/Stack";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { Button } from "@/components/Button";
import styles from "./delegateDialog.module.scss";
import { useModal } from "connectkit";
import { Button as ShadcnButton } from "@/components/ui/button";
import { DelegateChunk } from "@/components/Delegates/DelegateCardList/DelegateCardList";
import { useCallback, useEffect, useState } from "react";
import { Delegatees } from "@prisma/client";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { InfoIcon } from "lucide-react";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import { track } from "@vercel/analytics";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

export function DelegateDialog({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchDirectDelegatee,
  completeDelegation,
}: {
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<bigint>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<Delegatees>;
  completeDelegation: () => void;
}) {
  const { address: accountAddress } = useAccount();
  const { setOpen } = useModal();
  const [votingPower, setVotingPower] = useState<string>("");
  const [delegatee, setDelegatee] = useState<Delegatees | null>(null);
  const [isReady, setIsReady] = useState(false);

  const writeWithTracking = () => {
    const trackingData = {
      dao_slug: "OP",
      delegateAddress: delegate.address || "unknown",
      address: accountAddress || "unknown",
      delegateEnsName: delegateEnsName || "unknown",
      votingPower: votingPower || "unknown",
    };

    track("Delegate", trackingData);

    write();
  };

  const { data: delegateEnsName } = useEnsName({
    chainId: 1,
    address: delegate.address as `0x${string}`,
  });

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: delegatee?.delegatee as `0x${string}`,
  });

  const { isLoading, isSuccess, isError, write, data } = useContractWrite({
    address: OptimismContracts.token.address as any,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [delegate.address as any],
  });

  const fetchData = useCallback(async () => {
    setIsReady(false);
    if (!accountAddress) return;

    const vp = await fetchBalanceForDirectDelegation(accountAddress);
    setVotingPower(vp.toString());

    const direct = await fetchDirectDelegatee(accountAddress);
    setDelegatee(direct);

    setIsReady(true);
  }, [fetchBalanceForDirectDelegation, accountAddress, fetchDirectDelegatee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!isReady) {
    return (
      <VStack
        className="w-full h-[318px]"
        alignItems="items-center"
        justifyContent="justify-center"
      >
        <AgoraLoaderSmall />
      </VStack>
    );
  }

  return (
    <VStack alignItems="items-center" className={styles.dialog_container}>
      <VStack
        gap={6}
        justifyContent="justify-center"
        className="min-h-[318px] w-full"
      >
        {delegatee ? (
          <VStack
            gap={3}
            alignItems="items-center"
            className={styles.details_container}
          >
            <VStack className={styles.amount_container}>
              <HStack alignItems="items-center" gap={1}>
                Your total delegatable votes{" "}
                <InfoIcon size={12} className="opacity-50" />
              </HStack>
              <AdvancedDelegationDisplayAmount amount={votingPower} />
            </VStack>
            <VStack className="relative w-full">
              <HStack
                gap={3}
                alignItems="items-center"
                className="p-2 pb-4 pl-0 border-b border-gray-300"
              >
                <div className={styles.avatar}>
                  <ENSAvatar ensName={delegateeEnsName} />
                </div>
                <VStack>
                  <p className={styles.subtitle}>Currently delegated to</p>
                  <div className={styles.address_to}>
                    <ENSName address={delegatee.delegatee} />
                  </div>
                </VStack>
              </HStack>
              <div className="absolute flex items-center justify-center w-10 h-10 translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full right-1/2 top-1/2">
                <ArrowDownIcon className="w-4 h-4 text-black" />
              </div>
              <HStack
                gap={3}
                alignItems="items-center"
                className="p-2 pt-4 pl-0"
              >
                <div className={styles.avatar}>
                  <ENSAvatar ensName={delegateEnsName} />
                </div>
                <VStack>
                  <p className={styles.subtitle}>Delegating to</p>
                  <div className={styles.address_to}>
                    <ENSName address={delegate.address} />
                  </div>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        ) : (
          <VStack gap={4}>
            <p className="text-xl font-bold text-left">
              Set <ENSName address={delegate.address} /> as your delegate
            </p>
            <div className="text-gray-700">
              <ENSName address={delegate.address} /> will be able to vote with
              any token owned by your address
            </div>
            <VStack className="relative border border-gray-300 rounded-lg">
              <HStack
                gap={3}
                alignItems="items-center"
                className="p-2 border-b border-gray-300"
              >
                <div className={styles.avatar}>
                  <ENSAvatar ensName={""} />
                </div>
                <VStack>
                  <p className={styles.subtitle}>Currently delegated to</p>
                  <div className={styles.address_to}>
                    <p>N/A</p>
                  </div>
                </VStack>
              </HStack>
              <div className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full absolute right-4 top-[50%] translate-y-[-50%]">
                <ArrowDownIcon className="w-4 h-4 text-black" />
              </div>
              <HStack gap={3} alignItems="items-center" className="p-2">
                <div className={styles.avatar}>
                  <ENSAvatar ensName={delegateEnsName} />
                </div>
                <VStack>
                  <p className={styles.subtitle}>Delegating to</p>
                  <div className={styles.address_to}>
                    <ENSName address={delegate.address} />
                  </div>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        )}
        {!accountAddress && (
          <ShadcnButton variant="outline" onClick={() => setOpen(true)}>
            Connect wallet to delegate
          </ShadcnButton>
        )}
        {isLoading && (
          <Button disabled={false}>Submitting your delegation...</Button>
        )}
        {isSuccess && (
          <div>
            <Button className="w-full" disabled={false}>
              Delegation completed!
            </Button>
            <BlockScanUrls hash1={data?.hash} />
          </div>
        )}
        {isError && (
          <Button disabled={false} onClick={() => writeWithTracking()}>
            Delegation failed - try again
          </Button>
        )}
        {!isError && !isSuccess && !isLoading && accountAddress && (
          <ShadcnButton onClick={() => writeWithTracking()}>
            Delegate
          </ShadcnButton>
        )}
      </VStack>
    </VStack>
  );
}
