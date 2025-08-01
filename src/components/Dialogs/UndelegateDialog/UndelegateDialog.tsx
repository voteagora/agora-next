import {
  useAccount,
  useEnsName,
  useWaitForTransactionReceipt,
  useWriteContract,
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
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { DelegateePayload } from "@/app/api/common/delegations/delegation";
import Tenant from "@/lib/tenant/tenant";
import { revalidateData } from "./revalidateAction";
import { formatEther, zeroAddress } from "viem";
import { useSponsoredDelegation } from "@/hooks/useSponsoredDelegation";
import { useEthBalance } from "@/hooks/useEthBalance";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";

interface UndelegateActionButtonsProps {
  isDisabledInTenant: boolean;
  tokenSymbol: string;
  sameDelegatee: boolean;
  executeDelegate: () => void;
  isError: boolean;
  didFailDelegation: boolean;
  isProcessingDelegation: boolean;
  isProcessingSponsoredUnelegation: boolean;
  didProcessDelegation: boolean;
  didProcessSponsoredUnelegation: boolean;
  isGasRelayLive: boolean;
  sponsoredTxnHash: `0x${string}` | undefined;
  delegateTxHash: `0x${string}` | undefined;
}

const UndelegateActionButtons = ({
  isDisabledInTenant,
  tokenSymbol,
  sameDelegatee,
  executeDelegate,
  isError,
  didFailDelegation,
  isProcessingDelegation,
  isProcessingSponsoredUnelegation,
  didProcessDelegation,
  didProcessSponsoredUnelegation,
  isGasRelayLive,
  sponsoredTxnHash,
  delegateTxHash,
}: UndelegateActionButtonsProps) => {
  if (isDisabledInTenant) {
    return (
      <Button disabled={true}>
        {tokenSymbol} delegation is disabled at this time
      </Button>
    );
  }

  if (isError || didFailDelegation) {
    return (
      <Button disabled={false} onClick={executeDelegate}>
        Undelegation failed - try again
      </Button>
    );
  }

  if (isProcessingDelegation || isProcessingSponsoredUnelegation) {
    return (
      <Button disabled={true}>Submitting your undelegation request...</Button>
    );
  }

  if (didProcessDelegation || didProcessSponsoredUnelegation) {
    return (
      <div>
        <Button className="w-full" disabled={false}>
          Undelegation completed!
        </Button>
        <BlockScanUrls
          hash1={isGasRelayLive ? sponsoredTxnHash : delegateTxHash}
        />
      </div>
    );
  }

  if (sameDelegatee) {
    return (
      <ShadcnButton onClick={executeDelegate}>
        Remove your own delegation
      </ShadcnButton>
    );
  }

  return <ShadcnButton onClick={executeDelegate}>Undelegate</ShadcnButton>;
};

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
  const isGasRelayEnabled = ui.toggle("sponsoredDelegate")?.enabled === true;
  const gasRelayConfig = ui.toggle("sponsoredDelegate")
    ?.config as UIGasRelayConfig;

  const { data: sponsorBalance } = useEthBalance({
    enabled: isGasRelayEnabled,
    address: gasRelayConfig?.sponsorAddress,
  });

  const isGasRelayLive =
    isGasRelayEnabled &&
    Number(formatEther(sponsorBalance || 0n)) >=
      Number(gasRelayConfig?.minBalance) &&
    Number(votingPower) > Number(gasRelayConfig?.minVPToUseGasRelay);

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: delegatee?.delegatee as `0x${string}`,
  });

  const {
    call,
    isFetching: isProcessingSponsoredUnelegation,
    isFetched: didProcessSponsoredUnelegation,
    txHash: sponsoredTxnHash,
  } = useSponsoredDelegation({
    address: accountAddress,
    delegate: {
      address: zeroAddress,
      votingPower: { total: "0", direct: "0", advanced: "0" },
      statement: null,
      participation: 0,
    },
  });

  const {
    isError,
    writeContract: write,
    data: delegateTxHash,
  } = useWriteContract();

  const {
    isLoading: isProcessingDelegation,
    isSuccess: didProcessDelegation,
    isError: didFailDelegation,
  } = useWaitForTransactionReceipt({
    hash: isGasRelayLive ? sponsoredTxnHash : delegateTxHash,
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

  const executeDelegate = async () => {
    if (isGasRelayLive) {
      await call();
    } else {
      write({
        address: contracts.token.address as any,
        abi: contracts.token.abi,
        functionName: "delegate",
        args: [zeroAddress],
      });
    }
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
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Remove your delegate votes
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={zeroAddress} />
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

        <UndelegateActionButtons
          isDisabledInTenant={isDisabledInTenant}
          tokenSymbol={token.symbol}
          sameDelegatee={sameDelegatee}
          executeDelegate={executeDelegate}
          isError={isError}
          didFailDelegation={didFailDelegation}
          isProcessingDelegation={isProcessingDelegation}
          isProcessingSponsoredUnelegation={isProcessingSponsoredUnelegation}
          didProcessDelegation={didProcessDelegation}
          didProcessSponsoredUnelegation={didProcessSponsoredUnelegation}
          isGasRelayLive={isGasRelayLive}
          sponsoredTxnHash={sponsoredTxnHash}
          delegateTxHash={delegateTxHash}
        />
      </div>
    </div>
  );
}
