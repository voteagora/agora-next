'use client';

import { useWallet } from './useWallet';
import { publicEnv } from '@/lib/vibdao/public-env';
import { shortenAddress } from '@/lib/vibdao/format';

export function WalletStatus() {
  const wallet = useWallet(publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID, publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL);

  return (
    <div className="panel">
      <div className="panelHeader">
        <h3>Wallet</h3>
      </div>
      <div className="stackSm">
        <p className="muted">Connect a local wallet to donate, propose, vote, queue, execute, and claim salary.</p>
        {!wallet.hasProvider ? <p className="warning">No injected wallet found in this browser.</p> : null}
        <div className="walletRow">
          <span>{wallet.account ? shortenAddress(wallet.account) : 'Disconnected'}</span>
          <button className="button secondary" onClick={() => void wallet.connect()}>
            {wallet.account ? 'Reconnect' : 'Connect'}
          </button>
        </div>
        {wallet.isWrongChain ? (
          <button className="button secondary" onClick={() => void wallet.switchToTargetChain()}>
            Switch to {publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID}
          </button>
        ) : null}
      </div>
    </div>
  );
}
