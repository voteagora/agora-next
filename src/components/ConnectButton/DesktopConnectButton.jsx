import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { ProfileDropDownButton } from "../ProfileDropDownButton/ProfileDropDownButton";

export const DesktopConnectButton = () => {
  const { isConnected } = useAccount();

  return (
    <ConnectKitButton.Custom>
      {({ show, address, ensName }) => (
        <div className="bg-gray-fa rounded-full cursor-pointer hover:bg-gray-200">
          {!isConnected && (
            <div className="py-2 px-5" onClick={show}>
              Connect Wallet
            </div>
          )}
          <ProfileDropDownButton
            address={address}
            ensName={ensName}
            // TODO: replace with real data
            // fragment={delegate}
            // hasStatement={!!delegate.statement}
            hasStatement={true}
          />
        </div>
      )}
    </ConnectKitButton.Custom>
  );
};
