'use client';

import { useDeferredValue, useState, useTransition } from 'react';
import type { ClientContracts } from '@/lib/vibdao/contracts';
import { formatTokenAmount } from '@/lib/vibdao/format';
import { formatEther, parseEther } from 'viem';
import { getInjectedWalletClient, useWallet } from './useWallet';

type DonateFormProps = {
  contracts: ClientContracts;
  minimumDonation: string;
};

export function DonateForm({ contracts, minimumDonation }: DonateFormProps) {
  const wallet = useWallet(contracts.chainId, contracts.rpcUrl);
  const [amount, setAmount] = useState('1');
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredAmount = useDeferredValue(amount);
  const minimumDonationLabel = formatTokenAmount(minimumDonation);
  const minimumDonationInput = formatEther(BigInt(minimumDonation));

  const donate = () => {
    startTransition(() => {
      void (async () => {
        if (!wallet.account) throw new Error('Connect wallet first');
        if (wallet.isWrongChain) {
          await wallet.switchToTargetChain();
        }

        const parsed = parseEther(deferredAmount || '0');
        if (parsed <= 0n) throw new Error('Enter a valid amount');
        if (parsed < BigInt(minimumDonation)) {
          throw new Error(`Minimum donation is ${minimumDonationLabel} DOT`);
        }

        const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
        const [account] = await client.getAddresses();

        setStatus('Approving DOT...');
        await client.writeContract({
          account,
          address: contracts.addresses.dot,
          abi: contracts.abi.dot,
          functionName: 'approve',
          args: [contracts.addresses.donationController, parsed],
        });

        setStatus('Submitting donation...');
        await client.writeContract({
          account,
          address: contracts.addresses.donationController,
          abi: contracts.abi.donationController,
          functionName: 'donate',
          args: [parsed],
        });

        setStatus('Donation submitted. Give the indexer a moment to catch up.');
      })().catch((error) => {
        setStatus(error instanceof Error ? error.message : 'Donation failed');
      });
    });
  };

  const preview = (() => {
    const numeric = Number(deferredAmount);
    if (Number.isNaN(numeric) || numeric <= 0) return '0';
    return formatTokenAmount(parseEther(deferredAmount));
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-primary">Donate DOT</h3>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-secondary">
          Every DOT donated to the treasury mints the same amount of
          non-transferable VIB voting power.
        </p>
        <div className="rounded-lg border border-line bg-wash px-4 py-3 text-sm text-secondary">
          Minimum donation: <span className="font-semibold text-primary">{minimumDonationLabel} DOT</span>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-secondary">DOT amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min={minimumDonationInput}
            step="0.01"
            className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-primary outline-none transition-colors focus:border-primary"
          />
        </label>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-wash px-4 py-3">
          <span className="text-sm text-secondary">Expected VIB</span>
          <strong className="text-lg font-semibold text-primary">{preview}</strong>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          onClick={donate}
        >
          {isPending ? 'Submitting...' : 'Approve + Donate'}
        </button>
        {status ? <p className="text-sm leading-6 text-secondary">{status}</p> : null}
      </div>
    </div>
  );
}
