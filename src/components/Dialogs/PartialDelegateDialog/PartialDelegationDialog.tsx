import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { PartialDelegationEntry } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationEntry";
import Tenant from "@/lib/tenant/tenant";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import { PartialDelegationButton } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationButton";
import { PartialDelegationSuccess } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationSuccess";
import { formatPercentageWithPrecision } from "@/lib/utils";

interface Props {
  delegate: DelegateChunk;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<Delegation[]>;
  closeDialog: () => void;
}

export function PartialDelegationDialog({
  delegate,
  fetchCurrentDelegatees,
  closeDialog,
}: Props) {
  const { contracts } = Tenant.current();

  const { address } = useAccount();
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

  const fetchData = useCallback(async () => {
    try {
      if (!address) return;

      const rawTokenBalance = await contracts.token.contract.balanceOf(
        address as `0x${string}`
      );
      const rawDelegations = await fetchCurrentDelegatees(address);

      const isNewDelegate = !rawDelegations.find(
        (delegation) =>
          delegation.to.toLowerCase() === delegate.address.toLowerCase()
      );

      // Add new delegation to the end of the existing list
      if (isNewDelegate) {
        rawDelegations.push({
          from: address!,
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
  }, [address, delegate.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDelegations = (updatedDelegation: Delegation) => {
    setDelegations((prev) => {
      return prev.map((delegation) =>
        delegation.to === updatedDelegation.to ? updatedDelegation : delegation
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

  const renderTokenBalance = () => {
    if (tokenBalance) {
      return (
        <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center py-8 px-2 relative">
          <div className="flex flex-row items-center gap-1">
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
              className="hover:pointer hover:underline"
              onClick={() => delegateEvenly()}
            >
              Delegate Evenly
            </div>
          </div>
        )}
        <div className="mt-4">
          <PartialDelegationButton
            onSuccess={setSuccessHash}
            disabled={totalPercentage > 1 || !isUnsaved}
            delegations={delegations}
          />
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
          <AgoraLoaderSmall />
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
