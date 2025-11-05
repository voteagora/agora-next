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
import { useEffect, useRef, useState } from "react";
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
import { useSponsoredDelegation } from "@/hooks/useSponsoredDelegation";
import { useEthBalance } from "@/hooks/useEthBalance";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { formatEther, createWalletClient, custom } from "viem";
import { getPublicClient } from "@/lib/viem";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";

export function DelegateDialog({
  delegate,
  fetchDirectDelegatee,
  isDelegationEncouragement,
}: {
  delegate: DelegateChunk;
  fetchDirectDelegatee: (
    addressOrENSName: string
  ) => Promise<DelegateePayload | null>;
  isDelegationEncouragement?: boolean;
}) {
  const shouldFetchData = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const { ui, contracts, token, slug } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;

  const { address: accountAddress } = useAccount();

  const { data: tokenBalance } = useTokenBalance(accountAddress);
  const [delegatee, setDelegatee] = useState<DelegateePayload | null>(null);

  const { setRefetchDelegate } = useConnectButtonContext();

  // Gas relay settings
  const isGasRelayEnabled = ui.toggle("sponsoredDelegate")?.enabled === true;
  const gasRelayConfig = ui.toggle("sponsoredDelegate")
    ?.config as UIGasRelayConfig;

  const { data: sponsorBalance } = useEthBalance({
    enabled: isGasRelayEnabled,
    address: gasRelayConfig?.sponsorAddress,
  });

  // Gas relay is only LIVE when it is enabled in the settings and the sponsor meets minimum eth requirements and the user has enough token balance
  const isGasRelayLive =
    isGasRelayEnabled &&
    Number(formatEther(sponsorBalance || 0n)) >=
      Number(gasRelayConfig?.minBalance) &&
    Number(tokenBalance) > Number(gasRelayConfig?.minVPToUseGasRelay);

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

  const {
    call,
    isFetching: isProcessingSponsoredDelegation,
    isFetched: didProcessSponsoredDelegation,
    txHash: sponsoredTxnHash,
  } = useSponsoredDelegation({
    address: accountAddress,
    delegate,
  });

  const {
    isError,
    writeContract: write,
    data: delegateTxHash,
  } = useWriteContract();

  const [localDelegateTxHash, setLocalDelegateTxHash] = useState<
    `0x${string}` | undefined
  >(undefined);

  const {
    isLoading: isProcessingDelegation,
    isSuccess: didProcessDelegation,
    isError: didFailDelegation,
  } = useWaitForTransactionReceipt({
    hash: isGasRelayLive
      ? sponsoredTxnHash
      : (localDelegateTxHash ?? delegateTxHash),
  });

  const fetchData = async () => {
    if (shouldFetchData.current && accountAddress) {
      shouldFetchData.current = false;
      const direct = await fetchDirectDelegatee(accountAddress);
      setDelegatee(direct);
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (didProcessDelegation) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATE,
        event_data: {
          delegate: delegate.address as `0x${string}`,
          delegator: accountAddress as `0x${string}`,
          transaction_hash: (isGasRelayLive
            ? sponsoredTxnHash
            : (localDelegateTxHash ?? delegateTxHash)) as `0x${string}`,
        },
      });
      if (isDelegationEncouragement) {
        trackEvent({
          event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_CTA,
          event_data: {
            delegator: accountAddress as `0x${string}`,
            transaction_hash: (isGasRelayLive
              ? sponsoredTxnHash
              : (localDelegateTxHash ?? delegateTxHash)) as `0x${string}`,
          },
        });
      }
    }
  }, [didProcessDelegation]);

  async function executeDelegate() {
    if (isGasRelayLive) {
      await call();
    } else {
      try {
        // Bypass wagmi to avoid CAIP-2 chain id leakage from Safe provider
        const publicClient = getPublicClient(contracts.token.chain);
        const walletClient = createWalletClient({
          chain: contracts.token.chain,
          transport: custom(window.ethereum!),
        });

        const { request } = await publicClient.simulateContract({
          address: contracts.token.address as `0x${string}`,
          abi: contracts.token.abi,
          functionName: "delegate",
          args: [delegate.address as `0x${string}`],
          account: accountAddress as `0x${string}`,
        });

        const txHash = await walletClient.writeContract(request);
        setLocalDelegateTxHash(txHash);
      } catch (error) {
        console.error("delegate via viem failed", error);
        // Fallback to wagmi write (may still fail under Safe CAIP-2)
        try {
          write({
            address: contracts.token.address as any,
            abi: contracts.token.abi,
            functionName: "delegate",
            args: [delegate.address as any],
            chainId: contracts.token.chain.id,
          });
        } catch (innerError) {
          console.error("delegate via wagmi fallback failed", innerError);
        }
      }
    }
  }

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
        <Button disabled={false} onClick={executeDelegate}>
          Delegation failed - try again
        </Button>
      );
    }

    if (isProcessingDelegation || isProcessingSponsoredDelegation) {
      return <Button disabled={true}>Submitting your delegation...</Button>;
    }

    if (didProcessDelegation || didProcessSponsoredDelegation) {
      return (
        <div>
          <Button className="w-full" disabled={false}>
            Delegation completed!
          </Button>
          <BlockScanUrls
            hash1={
              isGasRelayLive
                ? sponsoredTxnHash
                : (localDelegateTxHash ?? delegateTxHash)
            }
          />
        </div>
      );
    }

    return <ShadcnButton onClick={executeDelegate}>Delegate</ShadcnButton>;
  };

  useEffect(() => {
    if (
      shouldFetchData.current &&
      accountAddress &&
      tokenBalance !== undefined
    ) {
      fetchData();
    }

    if (didProcessDelegation || didProcessSponsoredDelegation) {
      // Refresh delegation
      if (tokenBalance !== undefined && tokenBalance > 0n) {
        setRefetchDelegate({
          address: delegate.address,
          prevVotingPowerDelegatee: delegate.votingPower.total,
        });
      }
    }
  }, [didProcessDelegation, delegate, tokenBalance, accountAddress]);

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
          <div className="flex flex-col gap-3 items-center py-3 w-full text-tertiary text-xs">
            <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center w-full py-8 px-2">
              <div className="flex flex-row items-center gap-1">
                Your total delegatable votes
              </div>
              <AdvancedDelegationDisplayAmount
                amount={
                  tokenBalance !== undefined ? tokenBalance.toString() : "0"
                }
              />
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
            <p className="text-xl font-bold text-left text-primary">
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
