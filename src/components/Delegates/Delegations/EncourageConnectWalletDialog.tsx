import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";

export const EncourageConnectWalletDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
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
          <Button
            className="w-full px-[20px] py-3 font-medium text-[16px] leading-[24px]"
            onClick={() => {
              show?.();
              closeDialog();
            }}
          >
            Connect wallet
          </Button>
        )}
      </ConnectKitButton.Custom>
    </div>
  );
};
