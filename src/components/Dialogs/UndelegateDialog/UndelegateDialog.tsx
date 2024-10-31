import {
  useAccount,
  useWriteContract,
  useEnsName,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/Button";
import { Button as ShadcnButton } from "@/components/ui/button";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useCallback, useEffect, useState } from "react";
import {
  AgoraLoaderSmall,
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { DelegateePayload } from "@/app/api/common/delegations/delegation";
import Tenant from "@/lib/tenant/tenant";
import { revalidateData } from "./revalidateAction";

export function UndelegateDialog({
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
  const { ui, contracts, token } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const { address: accountAddress } = useAccount();
  const [votingPower, setVotingPower] = useState<string>("");
  const [delegatee, setDelegatee] = useState<DelegateePayload | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { setRefetchDelegate } = useConnectButtonContext();
  const sameDelegatee =
    delegate.address.toLowerCase() === accountAddress?.toLowerCase();

  const isDisabledInTenant = ui.toggle("delegates/delegate")?.enabled === false;

  const { data: accountEnsName } = useEnsName({
    chainId: 1,
    address: accountAddress as `0x${string}`,
  });

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: delegatee?.delegatee as `0x${string}`,
  });

  const { isError, writeContract: write, data } = useWriteContract();

  const {
    isLoading: isProcessingDelegation,
    isSuccess: didProcessDelegation,
    isError: didFailDelegation,
  } = useWaitForTransactionReceipt({
    hash: data,
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
          You are already delegated to yourself
        </ShadcnButton>
      );
    }

    if (isError || didFailDelegation) {
      return (
        <Button
          disabled={false}
          onClick={() =>
            write({
              address: contracts.token.address as any,
              abi: contracts.token.abi,
              functionName: "delegate",
              args: [accountAddress as `0x${string}`],
            })
          }
        >
          Undelegation failed - try again
        </Button>
      );
    }

    if (isProcessingDelegation) {
      return (
        <Button disabled={true}>Submitting your undelegation request...</Button>
      );
    }

    if (didProcessDelegation) {
      return (
        <div>
          <Button className="w-full" disabled={false}>
            Undelegation completed!
          </Button>
          <BlockScanUrls hash1={data} />
        </div>
      );
    }

    return (
      <ShadcnButton
        onClick={() =>
          write({
            address: contracts.token.address as any,
            abi: contracts.token.abi,
            functionName: "delegate",
            args: [accountAddress as `0x${string}`],
          })
        }
      >
        Undelegate
      </ShadcnButton>
    );
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
      revalidateData();
    }
  }, [isReady, fetchData, didProcessDelegation, delegate, votingPower]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[318px]">
        {shouldHideAgoraBranding ? <LogoLoader /> : <AgoraLoaderSmall />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
      <div className="flex flex-col gap-6 justify-center min-h-[318px] w-full">
        {delegatee ? (
          <div className="flex flex-col gap-3 items-center w-full text-tertiary text-xs">
            <div>
              <h2 className="text-xl font-bold text-primary">
                Remove <ENSName address={delegatee.delegatee} /> as your
                delegate
              </h2>
              <p className="text-sm text-secondary mt-1">
                This delegate will no longer be able to vote on your behalf.
                Your votes will be returned to you.
              </p>
            </div>
            <div className="flex flex-col relative w-full border border-line rounded-lg">
              <div className="flex flex-row items-center gap-3 p-4 border-b border-line">
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
              <div className="absolute flex items-center justify-center w-10 h-10 translate-x-3/4 -translate-y-1/2 bg-neutral border border-line rounded-full right-[50px] top-1/2">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row items-center gap-3 p-4">
                <ENSAvatar ensName={accountEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Delegate back to self (undelegate)
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={accountAddress!} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-left">
              You are not currently delegating any votes.
            </p>
          </div>
        )}

        {renderActionButtons()}
      </div>
    </div>
  );
}
