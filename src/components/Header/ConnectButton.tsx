"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";

export function ConnectButton() {
  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
