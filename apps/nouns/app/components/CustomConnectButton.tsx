"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import va from "@vercel/analytics"
import { LogOutIcon } from "lucide-react"
import { Button } from "ui"
import { useDisconnect } from "wagmi"

import { signMessage } from "../../utils"
import { useAppContext } from "../context"

export default function CustomConnectButton({
  signable = false,
  disconnectLabel = false
}) {
  const { isSigned, setIsSigned, signMessageAsync, isSignatureLoading } =
    useAppContext()

  const { disconnect } = useDisconnect()

  return (
    <div onClick={() => va.track("connect_wallet_attempt")}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted
        }) => {
          return (
            <div
              {...(!mounted && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none"
                }
              })}
            >
              {(() => {
                if (!mounted || !account || !chain) {
                  return (
                    <Button onClick={openConnectModal}>Connect Wallet</Button>
                  )
                }

                if (chain.unsupported) {
                  return <Button onClick={openChainModal}>Wrong network</Button>
                }

                if (signable && !isSigned) {
                  return (
                    <div
                      className={`${
                        !disconnectLabel
                          ? "flex items-center space-x-4"
                          : "space-y-4 text-center"
                      }`}
                    >
                      <Button
                        onClick={() =>
                          signMessage(
                            account.address as `0x${string}`,
                            signMessageAsync,
                            setIsSigned
                          )
                        }
                        // loading={isSignatureLoading}
                        // loadingMessage="Sign message"
                        // secondary
                      >
                        Login
                      </Button>
                      {!isSignatureLoading && (
                        <span
                          className="block cursor-pointer text-red-500 underline hover:text-red-700"
                          onClick={() => disconnect()}
                        >
                          {disconnectLabel ? (
                            "Disconnect wallet"
                          ) : (
                            <LogOutIcon className="h-6 w-6 rotate-180" />
                          )}
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <ConnectButton
                    accountStatus={{
                      smallScreen: "avatar",
                      largeScreen: "full"
                    }}
                    chainStatus={{ smallScreen: "none", largeScreen: "full" }}
                    showBalance={false}
                  />
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}
