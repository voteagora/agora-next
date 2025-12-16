import { ReactNode, useMemo } from "react";
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
import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { useEnsName } from "wagmi";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { DelegateToSelf } from "../Delegates/Delegations/DelegateToSelf";
import { ZERO_ADDRESS } from "@/lib/constants";
import { VotingPowerInfoTooltip } from "@/components/shared/VotingPowerInfoTooltip";

interface Props {
  ensName: string | undefined;
  handleCloseDrawer: () => void;
}

const DelegatePanelRow = ({
  delegate,
  onClick,
}: {
  delegate: Delegation;
  onClick: () => void;
}) => {
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: delegate.to as `0x${string}`,
  });

  return (
    <Link
      href={`/delegates/${delegate.to}`}
      className="flex justify-start text-neutral-900 items-center gap-2"
      onClick={onClick}
    >
      <div className="flex justify-start items-end">
        <ENSAvatar ensName={ensName} size={30} />
      </div>
      <div className="inline-flex flex-col justify-start items-start">
        <div className="text-base font-bold leading-normal">{ensName}</div>
        <div className="text-xs font-normal  leading-[18px]">
          {shortAddress(delegate.to)}
        </div>
      </div>
    </Link>
  );
};

const RenderDelegateToSelf = ({ delegate }: { delegate: DelegateChunk }) => {
  return (
    <div className="p-4 rounded-lg border border-line gap-2 bg-neutral">
      <div className="flex flex-col text-neutral-900 leading-normal">
        <div className="inline-flex gap-2">
          <ExclamationCircleIcon className="w-6 h-6 stroke-negative" />
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col justify-start items-start gap-1">
              <div className="text-base font-bold">
                Your tokens can&apos;t be voted with!
              </div>
              <div className="text-sm font-medium leading-[21px]">
                Make sure to delegate to yourself or to another active community
                member to ensure your votes count!
              </div>
            </div>
          </div>
        </div>
        <DelegateToSelf
          variant="rounded"
          className="outline outline-1 gap-2 justify-center mt-6 font-bold bg-primary text-neutral"
          delegate={delegate}
        />
      </div>
    </div>
  );
};

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
    delegatees,
  } = useProfileData();

  const { ui } = Tenant.current();
  const filteredDelegations = useMemo(() => {
    return delegatees?.filter((delegation) => delegation.to !== ZERO_ADDRESS);
  }, [delegatees]);
  const hasDelegated =
    Array.isArray(filteredDelegations) && filteredDelegations.length > 0;

  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  const shouldShowDelegateToSelfButton =
    tokenBalance !== undefined &&
    tokenBalance !== BigInt(0) &&
    filteredDelegations !== undefined &&
    !hasDelegated;

  const renderDelegteesInfo = () => {
    if (!hasDelegated) return null;

    if (
      filteredDelegations?.length === 1 &&
      filteredDelegations[0].to.toLowerCase() === address?.toLowerCase()
    ) {
      // dont show the section for self delegation.
      return null;
    }

    return (
      <div className="flex flex-col p-6 border-b border-line">
        <PanelRow
          title={
            filteredDelegations?.length > 1 ? "My Delegates" : "My Delegate"
          }
          detail={
            <div className="flex flex-col gap-4">
              {filteredDelegations?.slice(0, 3).map((delegate) => (
                <DelegatePanelRow
                  key={delegate.transaction_hash}
                  delegate={delegate}
                  onClick={handleCloseDrawer}
                />
              ))}
              {filteredDelegations?.length > 3 && (
                <Link
                  href={`/delegates/${address}?tab=delegations&subtab=delegatedTo`}
                  onClick={handleCloseDrawer}
                  className="text-sm text-tertiary font-xs border border-line self-end rounded-full px-2 py-1 "
                >
                  +{filteredDelegations?.length - 3}
                </Link>
              )}
            </div>
          }
        />
      </div>
    );
  };

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
            title={
              <span className="inline-flex items-center">
                My voting power
                <VotingPowerInfoTooltip />
              </span>
            }
            detail={
              <RowSkeletonWrapper isLoading={isFetching}>
                <TokenAmountDecorated
                  amount={delegate?.votingPower.total || BigInt(0)}
                />
              </RowSkeletonWrapper>
            }
          />
          {shouldShowDelegateToSelfButton &&
            isDelegationEncouragementEnabled && (
              <RenderDelegateToSelf delegate={delegate as DelegateChunk} />
            )}
        </div>
        {renderDelegteesInfo()}

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
                className="self-stretch h-12 pl-4 text-secondary flex items-center hover:bg-neutral hover:rounded-md"
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
          className="cursor-pointer flex font-bold"
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
