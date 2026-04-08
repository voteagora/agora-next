'use client';

import { startTransition, useEffect, useState } from 'react';
import type { ClientContracts } from '@/lib/vibdao/contracts';
import { formatTokenAmount } from '@/lib/vibdao/format';
import { getInjectedWalletClient, getPublicClient, useWallet } from './useWallet';

type ClaimCardProps = {
  contracts: ClientContracts;
};

export function ClaimCard({ contracts }: ClaimCardProps) {
  const wallet = useWallet(contracts.chainId, contracts.rpcUrl);
  const [claimable, setClaimable] = useState<string>('0');
  const [isActiveFellow, setIsActiveFellow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet.account) return;

    const publicClient = getPublicClient(contracts.chainId, contracts.rpcUrl);

    void Promise.all([
      publicClient.readContract({
        address: contracts.addresses.payroll,
        abi: contracts.abi.payroll,
        functionName: 'claimable',
        args: [wallet.account],
      }),
      publicClient.readContract({
        address: contracts.addresses.payroll,
        abi: contracts.abi.payroll,
        functionName: 'fellows',
        args: [wallet.account],
      }),
    ])
      .then(([claimableAmount, fellow]) => {
        setClaimable((claimableAmount as bigint).toString());
        const [active] = fellow as readonly [boolean, bigint, bigint, bigint, bigint];
        setIsActiveFellow(active);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load claimable salary');
      });
  }, [contracts, wallet.account]);

  const claim = () => {
    startTransition(() => {
      void (async () => {
        if (!wallet.account) throw new Error('Connect wallet first');
        if (wallet.isWrongChain) {
          await wallet.switchToTargetChain();
        }

        const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
        const [account] = await client.getAddresses();
        await client.writeContract({
          account,
          address: contracts.addresses.payroll,
          abi: contracts.abi.payroll,
          functionName: 'claim',
          args: [],
        });
        setMessage('Claim submitted. Refresh after the indexer processes the block.');
      })().catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Claim failed');
      });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-primary">Claim Salary</h3>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-wash px-4 py-3">
          <span className="text-sm text-secondary">Connected Fellow</span>
          <strong className="text-lg font-semibold text-primary">
            {isActiveFellow ? 'Yes' : 'No'}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-wash px-4 py-3">
          <span className="text-sm text-secondary">Claimable DOT</span>
          <strong className="text-lg font-semibold text-primary">
            {formatTokenAmount(claimable)}
          </strong>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          onClick={claim}
          disabled={!wallet.account}
        >
          Claim Salary
        </button>
        {message ? <p className="text-sm leading-6 text-secondary">{message}</p> : null}
      </div>
    </div>
  );
}
