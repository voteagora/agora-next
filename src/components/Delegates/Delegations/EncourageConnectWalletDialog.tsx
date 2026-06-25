import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

export const EncourageConnectWalletDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const { address } = useAccount();
  const copy = Tenant.current().ui.copy;

  useEffect(() => {
    if (address) {
      closeDialog();
    }
  }, [address, closeDialog]);
  return (
    <div className="flex flex-col gap-7 justify-center ">
      <div>
        <div className="text-primary text-2xl font-bold leading-loose">
          {copy.delegates.delegation.encourageTitle}
        </div>
        <div className="justify-start text-primary text-base font-medium leading-normal">
          {copy.delegates.delegation.encourageDescription}
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
            {copy.voting.connectWallet}
          </Button>
        )}
      </ConnectKitButton.Custom>
    </div>
  );
};
