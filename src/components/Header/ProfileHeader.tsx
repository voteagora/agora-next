import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { MetamaskIcon } from "@/icons/MetamaskIcon";
import { SafeIcon } from "@/icons/SafeIcon";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import ENSAvatar from "../shared/ENSAvatar";
import { shortAddress } from "@/lib/utils";
import { Chevron } from "@/icons/Chevron";
import SecondaryWalletsSelector from "./SecondaryWalletsSelector";
import { useGetSafesForAddress } from "@/hooks/useGetSafesForAddress";

export const ProfileHeader = ({
  address,
  ensName,
}: {
  address?: `0x${string}`;
  ensName?: string;
}) => {
  const { connector } = useAccount();
  const { data: safes } = useGetSafesForAddress(address);

  const connectorIcon = connector?.icon;
  const connectorName = connector?.name;

  const { selectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const secondaryWallets = isSelectedPrimaryAddress
    ? safes
    : [address as `0x${string}`];

  console.log(
    secondaryWallets,
    isSelectedPrimaryAddress,
    address,
    selectedWalletAddress
  );
  const [showSecondaryWallets, setShowSecondaryWallets] = useState(false);
  const walletIcon = () => {
    if (!isSelectedPrimaryAddress) {
      return (
        <SafeIcon
          width={24}
          height={24}
          className="absolute bottom-[-1px] right-[-5px] rounded-full"
        />
      );
    } else if (connectorName === "MetaMask") {
      return (
        <div className="rounded-full absolute bottom-[-1px] right-[-5px] border border-line h-[24px] w-[24px] bg-neutral-100 bg-neutral">
          <MetamaskIcon
            width={18}
            height={18}
            className="absolute bottom-[2px] right-[2px] rounded-full"
          />
        </div>
      );
    } else {
      return (
        <div className="rounded-full absolute bottom-[-2px] right-[-6px] border border-line h-[24px] w-[24px] bg-neutral-100">
          <img src={connectorIcon} className="h-[16px] w-[16px] m-[4px]" />
        </div>
      );
    }
  };
  return (
    <>
      <div className="flex flex-row items-center gap-2 text-primary">
        <div className={`relative aspect-square relative`}>
          {isSelectedPrimaryAddress ? (
            <ENSAvatar ensName={ensName} size={60} />
          ) : (
            <ENSAvatar size={60} />
          )}
          {walletIcon()}
        </div>
        <div className="flex flex-col flex-1">
          {ensName ? (
            <>
              <span className="text-primary font-bold">{ensName}</span>
              <span className="text-xs text-secondary">
                {shortAddress(selectedWalletAddress as string)}
              </span>
            </>
          ) : (
            <>
              <span className="text-primary">
                {shortAddress(selectedWalletAddress as string)}
              </span>
            </>
          )}
        </div>
        {safes && (
          <>
            <div className="px-2 py-1 rounded-full border border-line flex items-center gap-2 ">
              <div className="text-center justify-center text-neutral-900 text-xs font-medium">
                + {secondaryWallets?.length || 0}
              </div>
            </div>
            <Chevron
              onClick={() => setShowSecondaryWallets((expanded) => !expanded)}
              className={`stroke-primary transition-transform duration-200 cursor-pointer ${showSecondaryWallets ? "rotate-90" : "rotate-[270deg]"}`}
            />
          </>
        )}
      </div>
      {safes && showSecondaryWallets && (
        <SecondaryWalletsSelector wallets={secondaryWallets} />
      )}
    </>
  );
};
