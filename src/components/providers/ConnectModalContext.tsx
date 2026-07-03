"use client";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useModal } from "connectkit";
import { useDisconnect } from "wagmi";

type ConnectModalContextValue = {
  openConnectModal: () => void;
  // connectkit-useModal-compatible, so call sites can swap the import only
  setOpen: (open: boolean) => void;
  open: boolean;
  disconnect: () => void;
  isConnecting: boolean;
};

export const ConnectModalContext = createContext<ConnectModalContextValue>({
  openConnectModal: () => {},
  setOpen: () => {},
  open: false,
  disconnect: () => {},
  isConnecting: false,
});

export const useConnectModal = () => useContext(ConnectModalContext);

export function ConnectKitModalBridge({ children }: PropsWithChildren) {
  const { setOpen, open } = useModal();
  const { disconnect } = useDisconnect();
  const value = useMemo(
    () => ({
      openConnectModal: () => setOpen(true),
      setOpen,
      open,
      disconnect: () => disconnect(),
      isConnecting: false,
    }),
    [setOpen, open, disconnect]
  );
  return (
    <ConnectModalContext.Provider value={value}>
      {children}
    </ConnectModalContext.Provider>
  );
}
