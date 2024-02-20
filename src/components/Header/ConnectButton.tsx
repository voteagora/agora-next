"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

export function ConnectButton() {
  const chainIdOP = 10;
  const { chain } = useNetwork();
  const openDialog = useOpenDialog();

  return (
    <div>
      {chain?.id !== chainIdOP ? (
        <Button
          className="bg-red-700 hover:bg-red-600 text-xs sm:text-base p-2 sm:p-auto"
          onClick={() =>
            openDialog({
              type: "SWITCH_NETWORK",
              params: {
                chainId: chainIdOP,
              },
            })
          }
        >
          Wrong network
        </Button>
      ) : (
        <>
          <MobileConnectButton />
          <DesktopConnectButton />
        </>
      )}
    </div>
  );
}
