"use client"

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

import "@rainbow-me/rainbowkit/styles.css"

import { mainnet, sepolia } from "wagmi/chains"

import { appName } from "../components"

const alchemyId = String(process.env.NEXT_PUBLIC_ALCHEMY_ID)
const isProduction = process.env.NEXT_PUBLIC_ENV === "prod"

const customChains: Chain[] = isProduction ? [mainnet] : [sepolia]
const { chains, publicClient } = configureChains(customChains, [
  alchemyProvider({ apiKey: alchemyId }),
  publicProvider()
])

const { connectors } = getDefaultWallets({
  appName,
  chains
})

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export default function WalletProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        coolMode
        showRecentTransactions={true}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
