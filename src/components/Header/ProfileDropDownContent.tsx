import { ReactNode } from "react";
import { useDisconnect } from "wagmi";
import { shortAddress } from "@/lib/utils";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { CubeIcon } from "@/icons/CubeIcon";
import { Logout } from "@/icons/logout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProfileData } from "@/hooks/useProfileData";

import ENSAvatar from "../shared/ENSAvatar";
import TokenAmountDecorated from "../shared/TokenAmountDecorated";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  ensName: string | undefined;
  handleCloseDrawer: () => void;
}

export const ProfileDropDownContent = ({
  ensName,
  handleCloseDrawer,
}: Props) => {
  const { disconnect } = useDisconnect();
  const {
    address,
    isFetching,
    tokenBalance,
    delegate,
    scwAddress,
    hasStatement,
    canCreateDelegateStatement,
  } = useProfileData();

  const { ui } = Tenant.current();

  return (
    <>
      <div className="flex flex-col px-6 py-4 border-b border-line">
        <div className="flex flex-row items-center gap-2 text-primary">
          <div
            className={`relative aspect-square ${
              isFetching && "animate-pulse"
            }`}
          >
            <ENSAvatar ensName={ensName} size={60} />
          </div>
          <div className="flex flex-col flex-1">
            {ensName ? (
              <>
                <span className="text-primary font-bold">{ensName}</span>
                <span className="text-xs text-secondary">
                  {shortAddress(address!)}
                </span>
              </>
            ) : (
              <>
                <span className="text-primary">{shortAddress(address!)}</span>
              </>
            )}
          </div>
        </div>
        {scwAddress && (
          <div className="block sm:hidden">
            <div className="w-[60px] flex justify-center items-center">
              <div className="border-l border-dashed border-line h-2"></div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="w-[60px] flex justify-center items-center">
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
        {scwAddress && (
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <div className="flex flex-row items-center gap-2">
                    <div className="w-[60px] flex justify-center items-center">
                      <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
                        <CubeIcon
                          className="w-5 h-5"
                          fill={rgbStringToHex(ui?.customization?.primary)}
                        />
                      </div>
                    </div>
                    <div className="text-primary">
                      {shortAddress(scwAddress)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-[250px] p-3">
                  <div className="text-primary">Smart Contract Wallet</div>
                  <div className="text-xs text-secondary font-light">
                    Your SCW is where your governance power comes from. Your
                    stkDRV tokens establish your voting power or how much you
                    can delegate to another member.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <div className="self-stretch flex flex-col font-medium">
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
          <div className="flex flex-col p-6 font-medium">
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
                  className="self-stretch h-12 pl-4 text-secondary flex items-center hover:bg-neutral hover:font-bold hover:rounded-md"
                >
                  View my profile
                </Link>
                <Link
                  href={`/delegates/create`}
                  onClick={handleCloseDrawer}
                  className="self-stretch h-12 pl-4 flex text-secondary items-center hover:bg-neutral hover:font-bold hover:rounded-md"
                >
                  Edit delegate statement
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <div className="p-6 py-[30px] border-t border-line bg-neutral sm:rounded-bl-[16px] sm:rounded-br-[16px]">
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
    </>
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
