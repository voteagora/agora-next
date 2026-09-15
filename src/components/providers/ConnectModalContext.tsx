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
  isOpen: boolean;
  disconnect: () => void;
  isConnecting: boolean;
};

export const ConnectModalContext = createContext<ConnectModalContextValue>({
  openConnectModal: () => {},
  isOpen: false,
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
      isOpen: open,
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
