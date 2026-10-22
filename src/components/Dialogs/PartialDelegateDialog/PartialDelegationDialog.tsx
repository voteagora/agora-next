import { useAccount } from "wagmi";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { PartialDelegationEntry } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationEntry";
import Tenant from "@/lib/tenant/tenant";
import {
  AgoraLoaderSmall,
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import { PartialDelegationButton } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationButton";
import { PartialDelegationSuccess } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationSuccess";
import { formatPercentageWithPrecision } from "@/lib/utils";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { ScwPartialDelegationButton } from "@/components/Dialogs/PartialDelegateDialog/ScwPartialDelegationButton";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";

interface Props {
  delegate: DelegateChunk;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<Delegation[]>;
  closeDialog: () => void;
  isDelegationEncouragement?: boolean;
}

export function PartialDelegationDialog({
  delegate,
  fetchCurrentDelegatees,
  closeDialog,
  isDelegationEncouragement,
}: Props) {
  const { contracts, ui } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;

  const { address } = useAccount();
  const { data: scwAddress, enabled: isScwEnabled } = useSmartAccountAddress({
    owner: address,
  });

  const ownerAddress = scwAddress || address;

  const shouldFetchData = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [successHash, setSuccessHash] = useState<`0x${string}` | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [forceResetDelegations, setForceResetDelegations] = useState(0);

  const totalPercentage = delegations.reduce(
    (acc, curr) => acc + Number(curr.percentage),
    0
  );

  const delegatableBalace = async () => {
    try {
      return await contracts.token.contract.balanceOf(
        ownerAddress as `0x${string}`
      );
    } catch (e) {
      return BigInt(0);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      if (!ownerAddress) return;
      const rawTokenBalance = await delegatableBalace();

      shouldFetchData.current = false;
      const rawDelegations = await fetchCurrentDelegatees(ownerAddress);

      const isNewDelegate = !rawDelegations.find(
        (delegation) =>
          delegation.to.toLowerCase() === delegate.address.toLowerCase()
      );

      // Add new delegation to the end of the existing list
      if (isNewDelegate) {
        rawDelegations.push({
          from: ownerAddress!,
          to: delegate.address,
          allowance: "0",
          percentage: "0",
          timestamp: new Date(),
          type: "DIRECT",
          amount: "PARTIAL",
          transaction_hash: "0",
        });
      }

      setDelegations(rawDelegations);
      setTokenBalance(rawTokenBalance);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [ownerAddress, delegate.address]);

  useEffect(() => {
    if (shouldFetchData.current) {
      // Wait to for either a scw or a regular address to be available
      if (isScwEnabled && scwAddress) {
        fetchData();
      } else if (!isScwEnabled && address) {
        fetchData();
      }
    }
  }, [fetchData, address, scwAddress, isScwEnabled]);

  const updateDelegations = (updatedDelegation: Delegation) => {
    setDelegations((prev) => {
      return prev.map((delegation) =>
        delegation.to === updatedDelegation.to &&
        delegation.type === updatedDelegation.type
          ? updatedDelegation
          : delegation
      );
    });
    setIsUnsaved(true);
  };

  const delegateEvenly = () => {
    const chunk = Math.floor((1 / delegations.length) * 100);
    setDelegations((prev) =>
      prev.map((delegation) => ({
        ...delegation,
        percentage: (chunk / 100).toString(),
      }))
    );
    setIsUnsaved(true);
    setForceResetDelegations((prev) => prev + 1);
  };

  const onSuccess = (hash: `0x${string}`) => {
    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.PARTIAL_DELEGATION,
      event_data: {
        transaction_hash: hash,
        delegatees: delegations,
        delegator: ownerAddress as `0x${string}`,
        is_scw: isScwEnabled,
      },
    });
    setSuccessHash(hash);
    if (isDelegationEncouragement) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_CTA,
        event_data: {
          delegator: ownerAddress as `0x${string}`,
          transaction_hash: hash,
        },
      });
    }
  };

  const renderTokenBalance = () => {
    if (tokenBalance) {
      return (
        <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center py-8 px-2 relative">
          <div className="flex flex-row items-center gap-1 text-primary">
            Your total delegatable votes{" "}
          </div>
          <AdvancedDelegationDisplayAmount amount={tokenBalance as any} />
        </div>
      );
    }
  };

  const renderDelegations = () => {
    return (
      <div>
        <div className="flex flex-col">
          {delegations.map((delegation, idx) => {
            return (
              <PartialDelegationEntry
                delegation={delegation}
                total={tokenBalance as BigInt}
                onChange={updateDelegations}
                reset={forceResetDelegations}
                key={delegation.to}
              />
            );
          })}
        </div>
        {totalPercentage > 1 ? (
          <div className="text-sm p-2 bg-brandSecondary rounded-md text-red-negative">
            You can not delegate more than 100% of your voting power.
          </div>
        ) : (
          <div className="flex flex-row justify-between text-xs p-2 bg-brandSecondary rounded-md text-secondary">
            <div className="font-semibold">
              {formatPercentageWithPrecision(totalPercentage * 100, 2)}% of your
              votable supply is delegated
            </div>
            <div
              className="hover:underline cursor-pointer"
              onClick={() => delegateEvenly()}
            >
              Delegate Evenly
            </div>
          </div>
        )}
        <div className="mt-4">
          {scwAddress ? (
            <ScwPartialDelegationButton
              onSuccess={onSuccess}
              disabled={totalPercentage > 1 || !isUnsaved}
              delegations={delegations}
            />
          ) : (
            <PartialDelegationButton
              onSuccess={onSuccess}
              disabled={totalPercentage > 1 || !isUnsaved}
              delegations={delegations}
            />
          )}
        </div>
      </div>
    );
  };

  if (successHash) {
    return (
      <PartialDelegationSuccess closeDialog={closeDialog} hash={successHash} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-col w-full h-[318px] items-center justify-center">
          {shouldHideAgoraBranding ? <LogoLoader /> : <AgoraLoaderSmall />}
        </div>
      ) : (
        <div>
          {renderTokenBalance()}
          {renderDelegations()}
        </div>
      )}
    </div>
  );
}
