import { FC } from "react";
import { shortAddress } from "@/lib/utils";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useAccount } from "wagmi";
import { useSafeProtocolKit } from "@/contexts/SafeProtocolKit";
import ENSAvatar from "../shared/ENSAvatar";
import { SafeIcon } from "@/icons/SafeIcon";

interface SecondaryWalletsSelectorProps {
  wallets?: `0x${string}`[];
  onSelectSafe?: () => void;
}

const SecondaryWalletsSelector: FC<SecondaryWalletsSelectorProps> = ({
  wallets,
  onSelectSafe,
}) => {
  const { setSelectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const { address } = useAccount();
  const { initAndConnectProtocolKit, disconnectSafeWallet } =
    useSafeProtocolKit();
  const selectWallet = (safeAddress?: `0x${string}`) => {
    if (!safeAddress) {
      return;
    }
    if (isSelectedPrimaryAddress) {
      setSelectedWalletAddress(safeAddress);
      initAndConnectProtocolKit(safeAddress);
    } else {
      setSelectedWalletAddress(address);
    }

    if (onSelectSafe) {
      onSelectSafe();
    }
  };

  if (!wallets || wallets.length === 0) {
    return null;
  }

  return (
    <div className="pt-4">
      {wallets.map((safe) => (
        <div
          className="flex flex-row items-center gap-2 self-stretch h-12 pl-2 text-secondary flex items-center hover:bg-wash hover:rounded-md cursor-pointer"
          key={safe}
          onClick={() => selectWallet(safe)}
        >
          <div className={`relative aspect-square`}>
            {!isSelectedPrimaryAddress ? (
              <ENSAvatar size={30} />
            ) : (
              <SafeIcon width={30} height={30} className="rounded-full" />
            )}
          </div>
          <div className="flex flex-col flex-1">
            {safe ? (
              <>
                <span className="text-xs text-secondary">
                  {shortAddress(safe)}
                </span>
              </>
            ) : (
              <>
                <span className="text-primary">{shortAddress(safe)}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecondaryWalletsSelector;
