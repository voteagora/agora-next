import { useAccount, useBalance, useContractWrite } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { VStack } from "@/components/Layout/Stack";
import { OptimismContracts } from "@/lib/contracts/contracts";
import ENSName from "@/components/shared/ENSName";
import { DelegationDisplayAmount } from "./DelegationDisplayAmount";
import { Button } from "@/components/Button";
import styles from "./delegateDialog.module.scss";
import { useModal } from "connectkit";
import { Button as ShadcnButton } from "@/components/ui/button";
import { DelegateChunk } from "@/components/Delegates/DelegateCardList/DelegateCardList";
import { useCallback, useEffect, useState } from "react";
import { Delegatees } from "@prisma/client";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import HumanAddress from "@/components/shared/HumanAddress";

export function DelegateDialog({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchDirectDelegatee,
  completeDelegation,
}: {
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<Delegatees>;
  completeDelegation: () => void;
}) {
  const { address: accountAddress } = useAccount();
  const { setOpen } = useModal();
  const [votingPower, setVotingPower] = useState<string>("");
  const [delegatee, setDelegatee] = useState<Delegatees | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { isLoading, isSuccess, isError, write } = useContractWrite({
    address: OptimismContracts.token.address as any,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [delegate.address as any],
  });

  const fetchData = useCallback(async () => {
    setIsReady(false);
    if (!accountAddress) return;

    const vp = await fetchBalanceForDirectDelegation(accountAddress);
    setVotingPower(vp);

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
      <VStack gap={6} className="min-h-[318px] w-full">
        {delegatee ? (
          <VStack
            gap={3}
            alignItems="items-center"
            className={styles.details_container}
          >
            <VStack
              className={styles.amount_container}
              alignItems="items-center"
              gap={3}
            >
              {(() => {
                if (!votingPower) {
                  return <div>{`You don't have any tokens to delegate`}</div>;
                }
                return (
                  <>
                    <div>Delegating your</div>

                    <DelegationDisplayAmount amount={votingPower} />
                  </>
                );
              })()}
            </VStack>

            <VStack
              className={styles.transfer_symbol_container}
              alignItems="items-center"
            >
              <VStack
                justifyContent="justify-center"
                className={styles.circle_container}
              >
                <div className={styles.circle} />
              </VStack>

              <VStack className={styles.arrow_container}>
                <ArrowDownIcon className="text-black" />
              </VStack>
            </VStack>

            <VStack className={styles.amount_container}>
              <div className="text-center">
                To <ENSName address={delegate.address} /> who represents
              </div>

              {/* <DelegationDisplayAmount amount={votingPower} /> */}
            </VStack>
          </VStack>
        ) : (
          <div>
            <p className="text-xl font-bold text-left">
              Set <ENSName address={delegate.address} /> as your delegate
            </p>
            <div className="text-gray-700">
              <ENSName address={delegate.address} /> will be able to vote with
              any token owned by your address
            </div>
          </div>
        )}
        {!accountAddress && (
          <ShadcnButton variant="outline" onClick={() => setOpen(true)}>
            Connect wallet to vote
          </ShadcnButton>
        )}
        {isLoading && (
          <Button disabled={false}>Submitting your delegation...</Button>
        )}
        {isSuccess && <Button disabled={false}>Delegation completed!</Button>}
        {isError && (
          <Button disabled={false} onClick={() => write()}>
            Delegation failed - try again
          </Button>
        )}
        {!isError && !isSuccess && !isLoading && accountAddress && (
          <Button disabled={false} onClick={() => write()}>
            Delegate your votes
          </Button>
        )}
      </VStack>
    </VStack>
  );
}
