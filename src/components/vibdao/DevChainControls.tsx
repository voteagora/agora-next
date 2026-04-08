'use client';

import { startTransition, useState } from 'react';
import { publicEnv } from '@/lib/vibdao/public-env';
import { useWallet } from './useWallet';

async function rpc(method: string, params: unknown[] = []) {
  const provider = window.ethereum;
  if (!provider) throw new Error('No injected wallet found');
  return provider.request({ method, params });
}

export function DevChainControls() {
  const wallet = useWallet(publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID, publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL);
  const [message, setMessage] = useState<string | null>(null);

  const run = (label: string, action: () => Promise<void>) => {
    startTransition(() => {
      void action()
        .then(() => setMessage(`${label} completed`))
        .catch((error) => setMessage(error instanceof Error ? error.message : 'Chain action failed'));
    });
  };

  if (!wallet.hasProvider) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-primary">Local Dev Tools</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-wash"
          onClick={() => run('Mined 1 block', async () => void rpc('evm_mine'))}
        >
          Mine 1 Block
        </button>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-wash"
          onClick={() =>
            run('Mined 20 blocks', async () => {
              for (let i = 0; i < 20; i += 1) {
                await rpc('evm_mine');
              }
            })
          }
        >
          Mine 20 Blocks
        </button>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-wash"
          onClick={() =>
            run('Advanced 24 hours', async () => {
              await rpc('evm_increaseTime', [24 * 60 * 60]);
              await rpc('evm_mine');
            })
          }
        >
          +24h Timelock
        </button>
      </div>
      {message ? <p className="text-sm leading-6 text-secondary">{message}</p> : null}
    </div>
  );
}
