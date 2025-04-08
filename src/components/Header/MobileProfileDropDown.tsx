"use client";

import React, { ReactNode, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import ENSAvatar from "../shared/ENSAvatar";
import { shortAddress } from "@/lib/utils";
import Link from "next/link";
import TokenAmountDecorated from "../shared/TokenAmountDecorated";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { CubeIcon } from "@/icons/CubeIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { useDelegate } from "@/hooks/useDelegate";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Logout } from "@/icons/logout";
import { Drawer } from "../ui/Drawer";

type Props = {
  ensName: string | undefined;
};

export const MobileProfileDropDown = ({ ensName }: Props) => {
  const { ui } = Tenant.current();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  // Don't hydrate the component until the user clicks on the profile dropdown
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const isSmartAccountEnabled = ui?.smartAccountConfig?.factoryAddress;

  // The hook is called only when the component should be hydrated
  // Once the delegate is loaded

  // - if smart account is enabled
  // --- load smart account address
  // --- load balance of the smart account wallet

  // - if smart account is not enabled
  // --- load balance of the EOA
  const { data: delegate, isFetching } = useDelegate({
    address: shouldHydrate ? address : undefined,
  });

  // Load SCW address if delegate is loaded and smart accounts enabled
  const { data: scwAddress } = useSmartAccountAddress({
    owner: delegate ? (isSmartAccountEnabled ? address : undefined) : undefined,
  });

  // Load EOA token balance if delegate is loaded and scw not enabled
  const { data: tokenBalance } = useTokenBalance(
    delegate ? (isSmartAccountEnabled ? scwAddress : address) : undefined
  );

  const hasStatement = !!delegate?.statement;
  const canCreateDelegateStatement =
    ui?.toggle("delegates/edit")?.enabled === true;

  const handleOpenDrawer = () => {
    setIsOpen(true);
    setShouldHydrate(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-auto">
      <button className="mt-1 outline-none" onClick={handleOpenDrawer}>
        <div className="w-6 h-6 shadow-newDefault rounded-full">
          <ENSAvatar ensName={ensName} />
        </div>
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        showCloseButton={false}
        className="bg-wash rounded-t-2xl"
      >
        <div className="flex flex-col min-h-[280px] justify-center">
          <div className="flex flex-col px-6 py-4 border-b border-line">
            <div className="flex flex-row items-center gap-4 mb-1 text-primary">
              <div
                className={`relative aspect-square ${
                  isFetching && "animate-pulse"
                }`}
              >
                <ENSAvatar ensName={ensName} />
              </div>
              <div className="flex flex-col flex-1">
                {ensName ? (
                  <>
                    <span className="text-primary">{ensName}</span>
                    <span className="text-xs text-secondary">
                      {shortAddress(address!)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-primary">
                      {shortAddress(address!)}
                    </span>
                  </>
                )}
              </div>
            </div>
            {scwAddress && (
              <div>
                <div className="w-[44px] flex justify-center items-center">
                  <div className="border-l border-dashed border-line h-2"></div>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="w-[44px] flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
                      <CubeIcon
                        className="w-5 h-5"
                        fill={rgbStringToHex(ui?.customization?.primary)}
                      />
                    </div>
                  </div>
                  <div className="text-primary">{shortAddress(scwAddress)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="self-stretch flex flex-col">
            <div className="py-8 px-6 flex gap-4 flex-col border-b border-line">
              <PanelRow
                title={ui.tacticalStrings?.myBalance || "My token balance"}
                detail={
                  <RowSkeletonWrapper isLoading={isFetching}>
                    <TokenAmountDecorated amount={tokenBalance || BigInt(0)} />
                  </RowSkeletonWrapper>
                }
              />
              <PanelRow
                title="My voting power"
                detail={
                  <RowSkeletonWrapper isLoading={isFetching}>
                    <TokenAmountDecorated
                      amount={delegate?.votingPower.total || BigInt(0)}
                    />
                  </RowSkeletonWrapper>
                }
              />
            </div>

            {isFetching ? (
              <div className="flex flex-col p-6">
                <div className="self-stretch h-12 pl-6 flex items-center animate-pulse bg-tertiary/10 rounded-lg"></div>
                <div className="self-stretch h-12 pl-6 flex items-center animate-pulse bg-tertiary/10 rounded-lg mt-2"></div>
              </div>
            ) : (
              <div className="flex flex-col p-6">
                {canCreateDelegateStatement && !hasStatement ? (
                  <Link
                    href={`/delegates/create`}
                    className="rounded-full py-3 px-2 border border-line bg-brandPrimary hover:bg-none text-neutral flex justify-center mt-1"
                    onClick={handleCloseDrawer}
                  >
                    Create delegate statement
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/delegates/${ensName ?? address}`}
                      onClick={handleCloseDrawer}
                      className="self-stretch h-12 pl-4 flex items-center"
                    >
                      View my profile
                    </Link>
                    <Link
                      href={`/delegates/create`}
                      onClick={handleCloseDrawer}
                      className="self-stretch h-12 pl-4 flex items-center"
                    >
                      Edit delegate statement
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-line bg-neutral">
            <div
              onClick={() => {
                disconnect();
                handleCloseDrawer();
              }}
              className="cursor-pointer flex"
            >
              <Logout
                fill={rgbStringToHex(ui?.customization?.primary)}
                className={"mr-[10px] self-center"}
              />
              <span className="text-primary">Logout</span>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

const RowSkeletonWrapper = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) =>
  isLoading ? (
    <div className="animate-pulse bg-tertiary/10 h-5 w-[90px] rounded-2xl"></div>
  ) : (
    <div className="text-primary">{children}</div>
  );
