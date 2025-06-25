import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { UpdatedButton } from "@/components/Button";

export const EncourageConnectWalletDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const { address } = useAccount();
  useEffect(() => {
    if (address) {
      closeDialog();
    }
  }, [address, closeDialog]);
  return (
    <div className="flex flex-col gap-7 justify-center ">
      <div>
        <div className="text-neutral-900 text-2xl font-bold leading-loose">
          Governance starts with you!
        </div>
        <div className="justify-start text-neutral-700 text-base font-medium leading-normal">
          Your tokens matter— connect your wallet to delegate your voting power
          and shape the future of the collective.
        </div>
      </div>
      <ConnectKitButton.Custom>
        {({ show }) => (
          <UpdatedButton
            primaryTextColor="black"
            fullWidth
            size="large"
            onClick={() => {
              show?.();
              closeDialog();
            }}
          >
            Connect Wallet
          </UpdatedButton>
        )}
      </ConnectKitButton.Custom>
    </div>
  );
};
