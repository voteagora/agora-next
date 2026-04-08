'use client';

import { startTransition, useState } from 'react';
import type { ClientContracts } from '@/lib/vibdao/contracts';
import type { ProposalRecord } from '@/lib/vibdao/types';
import { getInjectedWalletClient, useWallet } from './useWallet';

type ProposalActionBarProps = {
  proposal: ProposalRecord;
  contracts: ClientContracts;
};

export function ProposalActionBar({ proposal, contracts }: ProposalActionBarProps) {
  const wallet = useWallet(contracts.chainId, contracts.rpcUrl);
  const [message, setMessage] = useState<string | null>(null);

  const run = (label: string, writer: (account: `0x${string}`) => Promise<void>) => {
    startTransition(() => {
      void (async () => {
        if (!wallet.account) throw new Error('Connect wallet first');
        if (wallet.isWrongChain) {
          await wallet.switchToTargetChain();
        }

        const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
        const [account] = await client.getAddresses();
        await writer(account);
        setMessage(`${label} submitted`);
      })().catch((error) => {
        setMessage(error instanceof Error ? error.message : `${label} failed`);
      });
    });
  };

  return (
    <div className="panel">
      <div className="panelHeader">
        <h3>Governance Actions</h3>
      </div>
      <div className="buttonRow">
        <button
          className="button secondary"
          onClick={() =>
            run('Vote For', async (account) => {
              const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
              await client.writeContract({
                account,
                address: contracts.addresses.governor,
                abi: contracts.abi.governor,
                functionName: 'castVote',
                args: [BigInt(proposal.proposalId), 1],
              });
            })
          }
        >
          Vote For
        </button>
        <button
          className="button secondary"
          onClick={() =>
            run('Vote Against', async (account) => {
              const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
              await client.writeContract({
                account,
                address: contracts.addresses.governor,
                abi: contracts.abi.governor,
                functionName: 'castVote',
                args: [BigInt(proposal.proposalId), 0],
              });
            })
          }
        >
          Vote Against
        </button>
        <button
          className="button secondary"
          onClick={() =>
            run('Queue', async (account) => {
              const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
              await client.writeContract({
                account,
                address: contracts.addresses.governor,
                abi: contracts.abi.governor,
                functionName: 'queue',
                args: [BigInt(proposal.proposalId)],
              });
            })
          }
        >
          Queue
        </button>
        <button
          className="button"
          onClick={() =>
            run('Execute', async (account) => {
              const client = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
              await client.writeContract({
                account,
                address: contracts.addresses.governor,
                abi: contracts.abi.governor,
                functionName: 'execute',
                args: [BigInt(proposal.proposalId)],
              });
            })
          }
        >
          Execute
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
