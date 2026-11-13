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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { encodeFunctionData, formatEther, zeroAddress } from "viem";
import { useSponsoredDelegation } from "@/hooks/useSponsoredDelegation";
import { useEthBalance } from "@/hooks/useEthBalance";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
  useAttachMiradorSubmittedTxHash,
} from "@/lib/mirador/frontendFlowTrace";
import { getWalletTraceAttributes } from "@/lib/mirador/walletTraceAttributes";
import {
  getWalletErrorDiagnostics,
  getWalletErrorMessage,
} from "@/lib/wallet/errors";
import { checkWalletReadinessOrCloseTrace } from "@/lib/wallet/transactionReadiness";

interface UndelegateActionButtonsProps {
  isDisabledInTenant: boolean;
  tokenSymbol: string;
  sameDelegatee: boolean;
  executeDelegate: () => void;
  isError: boolean;
  didFailDelegation: boolean;
  didFailSponsoredUndelegation: boolean;
  isProcessingDelegation: boolean;
  isProcessingSponsoredUndelegation: boolean;
  didProcessDelegation: boolean;
  didProcessSponsoredUndelegation: boolean;
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
  didFailSponsoredUndelegation,
  isProcessingDelegation,
  isProcessingSponsoredUndelegation,
  didProcessDelegation,
  didProcessSponsoredUndelegation,
  isGasRelayLive,
  sponsoredTxnHash,
  delegateTxHash,
}: UndelegateActionButtonsProps) => {
  const { ui } = Tenant.current();
  const copy = ui.copy;

  if (isDisabledInTenant) {
    return (
      <Button disabled={true}>
        {copy.delegates.delegation.disabled(tokenSymbol)}
      </Button>
    );
  }

  if (isError || didFailDelegation || didFailSponsoredUndelegation) {
    return (
      <Button disabled={false} onClick={executeDelegate}>
        {copy.delegates.delegation.undelegationFailed}
      </Button>
    );
  }

  if (isProcessingDelegation || isProcessingSponsoredUndelegation) {
    return (
      <Button disabled={true}>
        {copy.delegates.delegation.undelegationSubmitting}
      </Button>
    );
  }

  if (didProcessDelegation || didProcessSponsoredUndelegation) {
    return (
      <div>
        <Button className="w-full" disabled={false}>
          {copy.delegates.delegation.undelegationCompleted}
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
        {copy.delegates.delegation.removeOwnDelegation}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton onClick={executeDelegate}>
      {copy.delegates.delegation.undelegateAction}
    </ShadcnButton>
  );
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
  const copy = ui.copy;
  const delegationTraceRef = useRef<FrontendMiradorTrace>(null);
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const {
    address: accountAddress,
    chainId: accountChainId,
    connector,
    status: accountStatus,
  } = useAccount();
  const [votingPower, setVotingPower] = useState<string>("");
  const [delegatee, setDelegatee] = useState<DelegateePayload | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [walletReadinessError, setWalletReadinessError] =
    useState<Error | null>(null);
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
    isFetching: isProcessingSponsoredUndelegation,
    isFetched: didProcessSponsoredUndelegation,
    isError: didFailSponsoredUndelegation,
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
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isProcessingDelegation,
    isSuccess: didProcessDelegation,
    isError: didFailDelegation,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: isGasRelayLive ? undefined : delegateTxHash,
  });

  useAttachMiradorSubmittedTxHash({
    traceRef: delegationTraceRef,
    txHash: delegateTxHash,
    chainId: contracts.token.chain.id,
    details: "Submitted undelegation transaction",
    enabled: !isGasRelayLive,
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
    setWalletReadinessError(null);
    if (isGasRelayLive) {
      await call();
    } else {
      if (delegationTraceRef.current) {
        void closeFrontendMiradorFlowTrace(delegationTraceRef.current, {
          reason: "governance_delegation_restarted",
          eventName: "governance_delegation_restarted",
          details: {
            delegatee: zeroAddress,
            action: "undelegate",
          },
        });
      }
      const inputData = encodeFunctionData({
        abi: contracts.token.abi as any,
        functionName: "delegate",
        args: [zeroAddress],
      });
      const trace = startFrontendMiradorFlowTrace({
        name: "GovernanceDelegation",
        flow: MIRADOR_FLOW.governanceDelegation,
        step: "undelegation_submit",
        context: {
          walletAddress: accountAddress,
          chainId: contracts.token.chain.id,
        },
        tags: ["governance", "delegation", "frontend"],
        attributes: {
          delegatee: zeroAddress,
          delegationAction: "undelegate",
          ...getWalletTraceAttributes({
            accountChainId,
            accountStatus,
            connector,
            targetChainId: contracts.token.chain.id,
          }),
        },
        startEventName: "governance_delegation_started",
        startEventDetails: {
          delegatee: zeroAddress,
          action: "undelegate",
        },
      });
      delegationTraceRef.current = trace;
      attachMiradorTransactionArtifacts(trace, {
        chainId: contracts.token.chain.id,
        inputData,
      });

      const readinessError = checkWalletReadinessOrCloseTrace({
        connector,
        status: accountStatus,
        trace,
        traceRef: delegationTraceRef,
        reason: "governance_delegation_failed",
        eventName: "governance_delegation_failed",
        details: { delegatee: zeroAddress, action: "undelegate" },
      });
      if (readinessError) {
        setWalletReadinessError(readinessError);
        return;
      }

      write({
        address: contracts.token.address as any,
        abi: contracts.token.abi,
        functionName: "delegate",
        args: [zeroAddress],
        chainId: contracts.token.chain.id,
      });
    }
  };

  useEffect(() => {
    if (!isReady) {
      fetchData();
    }
  }, [isReady, fetchData]);

  useEffect(() => {
    if (didProcessDelegation) {
      if (delegationTraceRef.current) {
        void closeFrontendMiradorFlowTrace(delegationTraceRef.current, {
          reason: "governance_delegation_succeeded",
          eventName: "governance_delegation_succeeded",
          details: {
            delegatee: zeroAddress,
            action: "undelegate",
            transactionHash: delegateTxHash,
          },
        });
        delegationTraceRef.current = null;
      }
    }

    if (didProcessDelegation || didProcessSponsoredUndelegation) {
      // Refresh delegation
      if (Number(votingPower) > 0) {
        setRefetchDelegate({
          address: delegate.address,
          prevVotingPowerDelegatee: delegate.votingPower.total,
        });
      }
      revalidateData();
    }
  }, [didProcessDelegation, didProcessSponsoredUndelegation]);

  useEffect(() => {
    if (!delegationTraceRef.current || isGasRelayLive) {
      return;
    }

    if (didFailDelegation || isError) {
      const delegationError = writeError ?? receiptError;
      if (!delegationError) {
        return;
      }

      void closeFrontendMiradorFlowTrace(delegationTraceRef.current, {
        reason: "governance_delegation_failed",
        eventName: "governance_delegation_failed",
        details: {
          delegatee: zeroAddress,
          action: "undelegate",
          error: getWalletErrorMessage(
            delegationError,
            "Undelegation transaction failed"
          ),
          ...getWalletErrorDiagnostics(delegationError),
        },
      });
      delegationTraceRef.current = null;
    }
  }, [didFailDelegation, isError, isGasRelayLive, receiptError, writeError]);

  useEffect(() => {
    return () => {
      if (!delegationTraceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(delegationTraceRef.current, {
        reason: "governance_delegation_unmounted",
        eventName: "governance_delegation_unmounted",
        details: {
          delegatee: zeroAddress,
          action: "undelegate",
        },
      });
      delegationTraceRef.current = null;
    };
  }, []);

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
                Remove <ENSName address={delegatee.delegatee} /> as your{" "}
                {copy.nouns.representative}
              </h2>
              <p className="text-sm text-secondary mt-1">
                {copy.delegates.delegation.removeDescription}
              </p>
            </div>
            <div className="flex flex-col relative w-full border border-line rounded-lg">
              <div className="flex flex-row items-center gap-3 p-4 border-b border-line">
                <ENSAvatar
                  ensName={delegateeEnsName}
                  className="h-10 w-10"
                  size={40}
                />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    {copy.delegates.delegation.currentDelegate}
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
                    {copy.delegates.delegation.removeVotes}
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
              {copy.delegates.delegation.notDelegating}
            </p>
          </div>
        )}

        <UndelegateActionButtons
          isDisabledInTenant={isDisabledInTenant}
          tokenSymbol={token.symbol}
          sameDelegatee={sameDelegatee}
          executeDelegate={executeDelegate}
          isError={isError || !!walletReadinessError}
          didFailDelegation={didFailDelegation}
          didFailSponsoredUndelegation={didFailSponsoredUndelegation}
          isProcessingDelegation={isProcessingDelegation}
          isProcessingSponsoredUndelegation={isProcessingSponsoredUndelegation}
          didProcessDelegation={didProcessDelegation}
          didProcessSponsoredUndelegation={didProcessSponsoredUndelegation}
          isGasRelayLive={isGasRelayLive}
          sponsoredTxnHash={sponsoredTxnHash}
          delegateTxHash={delegateTxHash}
        />
      </div>
    </div>
  );
}
