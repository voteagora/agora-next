import { ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { Logout } from "@/icons/logout";
import { useProfileData } from "@/hooks/useProfileData";
import TokenAmountDecorated from "../shared/TokenAmountDecorated";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { useGetSafesForAddress } from "@/hooks/useGetSafesForAddress";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { ProfileScwContent } from "./ProfileScwContent";
import { ProfileHeader } from "./ProfileHeader";

interface Props {
  ensName: string | undefined;
  handleCloseDrawer: () => void;
}

export const ProfileDropDownContent = ({
  ensName,
  handleCloseDrawer,
}: Props) => {
  const { disconnect } = useDisconnect();
  const { selectedWalletAddress } = useSelectedWallet();
  const { address } = useAccount();
  const {
    isFetching,
    tokenBalance,
    delegate,
    scwAddress,
    hasStatement,
    canCreateDelegateStatement,
  } = useProfileData(selectedWalletAddress);
  const { ui } = Tenant.current();

  return (
    <>
      <div className="flex flex-col px-6 py-4 border-b border-line">
        <ProfileHeader address={address} ensName={ensName} />
        {scwAddress && <ProfileScwContent scwAddress={scwAddress} />}
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
