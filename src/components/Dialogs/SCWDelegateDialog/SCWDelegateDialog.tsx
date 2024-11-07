import { useAccount, useEnsName } from "wagmi";
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
import { DelegateePayload } from "@/app/api/common/delegations/delegation";
import Tenant from "@/lib/tenant/tenant";
import { DelegateButton } from "@/components/Dialogs/SCWDelegateDialog/DelegateButton";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";

export function SCWDelegateDialog({
  delegate,
  fetchDirectDelegatee,
}: {
  delegate: DelegateChunk;
  fetchDirectDelegatee: (
    addressOrENSName: string
  ) => Promise<DelegateePayload | null>;
}) {
  const { ui, token } = Tenant.current();

  // Toggles
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const isDisabledInTenant = ui.toggle("delegates/delegate")?.enabled === false;

  const { address } = useAccount();

  const { data: scwAddress } = useSmartAccountAddress({ owner: address });
  const { data: scwTokenBalance } = useTokenBalance(scwAddress);

  const [currentDelegate, setCurrentDelegate] =
    useState<DelegateePayload | null>();

  const [isReady, setIsReady] = useState(false);

  const { data: delegateEnsName } = useEnsName({
    chainId: 1,
    address: delegate.address as `0x${string}`,
  });

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: currentDelegate?.delegatee as `0x${string}`,
  });

  const fetchData = useCallback(async () => {
    setIsReady(false);

    try {
      const direct = await fetchDirectDelegatee(scwAddress!);
      setCurrentDelegate(direct);
    } finally {
      setIsReady(true);
    }
  }, [scwAddress, fetchDirectDelegatee]);

  useEffect(() => {
    if (!isReady && scwAddress) {
      fetchData();
    }
  }, [isReady, fetchData, delegate, scwTokenBalance, scwAddress]);

  const renderActionButtons = () => {
    if (isDisabledInTenant) {
      return (
        <Button disabled={true}>
          {token.symbol} delegation is disabled at this time
        </Button>
      );
    }

    if (delegate.address === currentDelegate?.delegatee) {
      return (
        <ShadcnButton variant="outline" className="cursor-not-allowed">
          You cannot delegate to the same address again
        </ShadcnButton>
      );
    }

    return (
      <DelegateButton
        delegate={delegate}
        onSuccess={(txn) => console.log(txn)}
      />
    );
  };

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
        <div className="flex flex-col gap-3 items-center py-3 w-full text-tertiary text-xs">
          <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center w-full py-8 px-2">
            <div className="flex flex-row items-center gap-1">
              Your total delegatable voting power
            </div>
            {scwTokenBalance && (
              <AdvancedDelegationDisplayAmount
                amount={BigInt(scwTokenBalance).toString()}
              />
            )}
          </div>
          <div className="flex flex-col relative w-full">
            <div className="flex flex-row items-center gap-3 p-2 pb-4 pl-0 border-b border-line">
              <ENSAvatar ensName={delegateeEnsName} className="h-10 w-10" />
              <div className="flex flex-col">
                {currentDelegate ? (
                  <>
                    <p className="text-xs font-medium text-secondary">
                      Currently delegated to
                    </p>
                    <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                      <ENSName address={currentDelegate.delegatee} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium text-secondary">
                      Voting power not delegated
                    </p>
                  </>
                )}
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
        {renderActionButtons()}
      </div>
    </div>
  );
}
