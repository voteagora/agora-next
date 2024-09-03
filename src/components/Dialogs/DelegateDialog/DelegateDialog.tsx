import {
  useAccount,
  useContractWrite,
  useEnsName,
  useWaitForTransaction,
} from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/Button";
import { Button as ShadcnButton } from "@/components/ui/button";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useCallback, useEffect, useState } from "react";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import { track } from "@vercel/analytics";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { DelegateePayload } from "@/app/api/common/delegations/delegation";
import Tenant from "@/lib/tenant/tenant";

export function DelegateDialog({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchDirectDelegatee,
}: {
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<bigint>;
  fetchDirectDelegatee: (
    addressOrENSName: string
  ) => Promise<DelegateePayload | null>;
}) {
  const { ui, contracts, slug, token } = Tenant.current();

  const { address: accountAddress } = useAccount();

  const [votingPower, setVotingPower] = useState<string>("");
  const [delegatee, setDelegatee] = useState<DelegateePayload | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { setRefetchDelegate } = useConnectButtonContext();
  const sameDelegatee = delegate.address === delegatee?.delegatee;

  const isDisabledInTenant = ui.toggle("delegates/delegate")?.enabled === false;

  const { data: delegateEnsName } = useEnsName({
    chainId: 1,
    address: delegate.address as `0x${string}`,
  });

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: delegatee?.delegatee as `0x${string}`,
  });

  const { isError, writeAsync, write, data } = useContractWrite({
    address: contracts.token.address as any,
    abi: contracts.token.abi,
    functionName: "delegate",
    args: [delegate.address as any],
  });

  const {
    isLoading: isProcessingDelegation,
    isSuccess: didProcessDelegation,
    isError: didFailDelegation,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const fetchData = useCallback(async () => {
    setIsReady(false);
    if (!accountAddress) return;

    try {
      const vp = await fetchBalanceForDirectDelegation(accountAddress);
      setVotingPower(vp.toString());

      const direct = await fetchDirectDelegatee(accountAddress);
      setDelegatee(direct);
    } finally {
      setIsReady(true);
    }
  }, [fetchBalanceForDirectDelegation, accountAddress, fetchDirectDelegatee]);

  const renderActionButtons = () => {
    if (isDisabledInTenant) {
      return (
        <Button disabled={true}>
          {token.symbol} delegation is disabled at this time
        </Button>
      );
    }

    if (sameDelegatee) {
      return (
        <ShadcnButton variant="outline" className="cursor-not-allowed">
          You cannot delegate to the same address again
        </ShadcnButton>
      );
    }

    if (isError || didFailDelegation) {
      return (
        <Button disabled={false} onClick={() => write?.()}>
          Delegation failed - try again
        </Button>
      );
    }

    if (isProcessingDelegation) {
      return <Button disabled={true}>Submitting your delegation...</Button>;
    }

    if (didProcessDelegation) {
      return (
        <div>
          <Button className="w-full" disabled={false}>
            Delegation completed!
          </Button>
          <BlockScanUrls hash1={data?.hash} />
        </div>
      );
    }

    return <ShadcnButton onClick={() => write?.()}>Delegate</ShadcnButton>;
  };

  useEffect(() => {
    if (!isReady) {
      fetchData();
    }

    if (didProcessDelegation) {
      // Refresh delegation
      if (Number(votingPower) > 0) {
        setRefetchDelegate({
          address: delegate.address,
          prevVotingPowerDelegatee: delegate.votingPower.total,
        });
      }
      // Track delegation event
      // TODO: Andrei - verify that vercel analytics are still needed given that tenants now support Google Analytics
      const trackingData = {
        dao_slug: slug,
        delegateAddress: delegate.address || "unknown",
        address: accountAddress || "unknown",
        delegateEnsName: delegateEnsName || "unknown",
        votingPower: votingPower || "unknown",
      };

      track("Delegate", trackingData);
    }
  }, [isReady, fetchData, didProcessDelegation, delegate, votingPower]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[318px]">
        <AgoraLoaderSmall />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
      <div className="flex flex-col gap-6 justify-center min-h-[318px] w-full">
        {delegatee ? (
          <div className="flex flex-col gap-3 items-center py-3 w-full text-tertiary text-xs">
            <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center w-full py-8 px-2">
              <div className="flex flex-row items-center gap-1">
                Your total delegatable votes
              </div>
              <AdvancedDelegationDisplayAmount amount={votingPower} />
            </div>
            <div className="flex flex-col relative w-full">
              <div className="flex flex-row items-center gap-3 p-2 pb-4 pl-0 border-b border-line">
                <ENSAvatar ensName={delegateeEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Currently delegated to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegatee.delegatee} />
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center w-10 h-10 translate-x-1/2 -translate-y-1/2 bg-neutral border border-line rounded-full right-1/2 top-1/2">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row items-center gap-3 p-2 pt-4 pl-0">
                <ENSAvatar ensName={delegateEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Delegating to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegate.address} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-left">
              Set <ENSName address={delegate.address} /> as your delegate
            </p>
            <div className="text-secondary">
              <ENSName address={delegate.address} /> will be able to vote with
              any token owned by your address
            </div>
            <div className="flex flex-col relative border border-line rounded-lg">
              <div className="flex flex-row items-center gap-3 p-2 border-b border-line">
                <ENSAvatar ensName={""} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Currently delegated to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <p>N/A</p>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-neutral border border-line rounded-full absolute right-4 top-[50%] translate-y-[-50%]">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row gap-3 items-center p-2">
                <ENSAvatar ensName={delegateEnsName} className="w-10 h-10" />

                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Delegating to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegate.address} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderActionButtons()}
      </div>
    </div>
  );
}
