// TODO: replace mock data with real data from backend
const delegate = {
  address: {
    resolvedName: {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      name: "agora.eth",
    },
  },
  delegateMetrics: {
    tokenHoldersRepresentedCount: 50,
  },
  tokensRepresented: {
    amount: "1000",
  },
  delegatingTo: {
    address: {
      resolvedName: {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      },
    },
  },
  amountOwned: {
    amount: "50",
  },
  statement: true,
};

import { ConnectKitButton } from "connectkit";
import { ProfileDropDown } from "../ProfileDropDown/ProfileDropDown";
import { icons } from "@/icons/icons";
import Image from "next/image";

export const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address, ensName }) => (
        <>
          <div className="hidden md:block bg-gray-fa rounded-full cursor-pointer hover:bg-gray-200">
            {!isConnected && (
              <div className="py-2 px-5" onClick={show}>
                Connect Wallet
              </div>
            )}
            <ProfileDropDown
              address={address}
              ensName={ensName}
              delegate={delegate}
            />
          </div>
          <div className="block md:hidden">
            {!isConnected && (
              <div onClick={show}>
                <Image
                  src={icons.wallet}
                  alt="connect wallet button"
                  className="opacity-60"
                  height="24"
                  width="24"
                />
              </div>
            )}
            {isConnected && delegate && (
              <ProfileDropDown address={address} delegate={delegate} />
            )}
          </div>
        </>
      )}
    </ConnectKitButton.Custom>
  );
};
