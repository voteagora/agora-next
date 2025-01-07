import { useAccount, useEnsName } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/Button";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import React from "react";
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
import { CubeIcon } from "@/icons/CubeIcon";
import { shortAddress } from "@/lib/utils";
import { rgbStringToHex } from "@/app/lib/utils/color";

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

  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  const { data: delegateEnsName } = useEnsName({
    chainId: 1,
    address: delegate.address as `0x${string}`,
  });

  const renderActionButtons = () => {
    if (isDisabledInTenant) {
      return (
        <Button disabled={true}>
          {token.symbol} delegation is disabled at this time
        </Button>
      );
    }

    return (
      <DelegateButton
        delegate={delegate}
        onSuccess={(txn) => console.log(txn)}
      />
    );
  };

  if (!scwAddress) {
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
          <div className="flex flex-col text-xs justify-center items-center w-full py-3 px-2">
            <div className="flex flex-row items-center gap-1">
              Your total delegatable voting power
            </div>
            {scwTokenBalance && (
              <AdvancedDelegationDisplayAmount
                amount={BigInt(scwTokenBalance).toString()}
              />
            )}
          </div>
          <div className="flex flex-col relative w-full bg-wash rounded-md border border-line">
            <div className="flex flex-col border-b border-line p-2">
              <div className="text-secondary mb-1">Delegating from</div>
              <div className="flex flex-row items-center gap-3 p-2 pl-0">
                <ENSAvatar ensName={ensName} className="h-[44px] w-[44px]" />
                <div className="flex flex-row gap-2 items-center justify-center text-sm font-semibold text-primary max-w-[6rem] sm:max-w-full">
                  <ENSName address={address!} />
                  <div className="flex bg-primary text-neutral text-[8px] uppercase rounded-full px-1">
                    you
                  </div>
                </div>
              </div>

              <div>
                <div className="w-[44px] flex justify-center items-center">
                  <div className="border-l border-dashed border-line h-2"></div>
                </div>

                <div className="flex flex-row items-center gap-3">
                  <div className="w-[44px] flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
                      <CubeIcon
                        className="w-5 h-5"
                        fill={rgbStringToHex(ui.customization?.primary)}
                      />
                    </div>
                  </div>
                  <div className="text-primary">{shortAddress(scwAddress)}</div>
                </div>
              </div>
            </div>

            <div className="absolute flex items-center justify-center w-10 h-10 bg-neutral border border-line rounded-full right-[40px] top-[118px]">
              <ArrowDownIcon className="w-4 h-4 text-primary" />
            </div>

            <div className="p-2">
              <div className="text-secondary font-sm mb-1">Delegating to</div>
              <div className="flex flex-row items-center gap-3 p-2 pl-0">
                <ENSAvatar ensName={delegateEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <div className="text-sm font-semibold text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegate.address} />
                  </div>
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
