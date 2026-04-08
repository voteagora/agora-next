'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, createWalletClient, custom, defineChain, http } from 'viem';

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function toHexChainId(chainId: number): `0x${string}` {
  return `0x${chainId.toString(16)}`;
}

export function createLocalChain(chainId: number, rpcUrl: string) {
  return defineChain({
    id: chainId,
    name: 'Vibly Local',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
  });
}

export function useWallet(chainId: number, rpcUrl: string) {
  const [account, setAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    const refresh = async () => {
      const [accounts, chainHex] = await Promise.all([
        provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
        provider.request({ method: 'eth_chainId' }) as Promise<string>,
      ]);
      setAccount(accounts[0] ?? null);
      setCurrentChainId(Number.parseInt(chainHex, 16));
    };

    const handleAccountsChanged = (...args: unknown[]) => {
      const [accounts] = args as [string[]];
      setAccount(accounts?.[0] ?? null);
    };

    const handleChainChanged = (...args: unknown[]) => {
      const [chainHex] = args as [string];
      setCurrentChainId(Number.parseInt(chainHex, 16));
    };

    void refresh();
    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async () => {
    const provider = window.ethereum;
    if (!provider) throw new Error('No injected wallet found');

    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    const chainHex = (await provider.request({ method: 'eth_chainId' })) as string;
    setAccount(accounts[0] ?? null);
    setCurrentChainId(Number.parseInt(chainHex, 16));
  };

  const switchToTargetChain = async () => {
    const provider = window.ethereum;
    if (!provider) throw new Error('No injected wallet found');

    const targetChainHex = toHexChainId(chainId);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainHex }],
      });
    } catch {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: targetChainHex,
            chainName: 'Vibly Local',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [rpcUrl],
          },
        ],
      });
    }
  };

  return {
    account,
    chainId: currentChainId,
    hasProvider: typeof window !== 'undefined' && Boolean(window.ethereum),
    isWrongChain: currentChainId != null && currentChainId !== chainId,
    connect,
    switchToTargetChain,
  };
}

export function getInjectedWalletClient(chainId: number, rpcUrl: string) {
  if (!window.ethereum) throw new Error('No injected wallet found');

  return createWalletClient({
    chain: createLocalChain(chainId, rpcUrl),
    transport: custom(window.ethereum),
  });
}

export function getPublicClient(chainId: number, rpcUrl: string) {
  return createPublicClient({
    chain: createLocalChain(chainId, rpcUrl),
    transport: http(rpcUrl),
  });
}
