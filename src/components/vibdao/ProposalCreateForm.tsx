'use client';

import { encodeFunctionData, parseEther } from 'viem';
import { startTransition, useState } from 'react';
import type { ClientContracts } from '@/lib/vibdao/contracts';
import { getInjectedWalletClient, useWallet } from './useWallet';

type ProposalType = 'GrantProposal' | 'AddFellowProposal' | 'RemoveFellowProposal' | 'UpdateSalaryProposal';
type ExtendedProposalType = ProposalType | 'UpdateMinimumDonationProposal';

type ProposalCreateFormProps = {
  contracts: ClientContracts;
};

export function ProposalCreateForm({ contracts }: ProposalCreateFormProps) {
  const wallet = useWallet(contracts.chainId, contracts.rpcUrl);
  const [proposalType, setProposalType] = useState<ExtendedProposalType>('GrantProposal');
  const [member, setMember] = useState('0x90F79bf6EB2c4f870365E785982E1f101E93b906');
  const [recipient, setRecipient] = useState('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65');
  const [amount, setAmount] = useState('25');
  const [salary, setSalary] = useState('120');
  const [minimumDonation, setMinimumDonation] = useState('1');
  const [description, setDescription] = useState('Vibly local proposal');
  const [message, setMessage] = useState<string | null>(null);

  const submit = () => {
    startTransition(() => {
      void (async () => {
        if (!wallet.account) throw new Error('Connect wallet first');
        if (wallet.isWrongChain) {
          await wallet.switchToTargetChain();
        }

        const walletClient = getInjectedWalletClient(contracts.chainId, contracts.rpcUrl);
        const [account] = await walletClient.getAddresses();

        let target = contracts.addresses.treasury;
        let calldata: `0x${string}`;

        if (proposalType === 'GrantProposal') {
          calldata = encodeFunctionData({
            abi: contracts.abi.treasury,
            functionName: 'grantToken',
            args: [recipient as `0x${string}`, parseEther(amount)],
          });
        } else if (proposalType === 'AddFellowProposal') {
          target = contracts.addresses.payroll;
          calldata = encodeFunctionData({
            abi: contracts.abi.payroll,
            functionName: 'addFellow',
            args: [member as `0x${string}`, parseEther(salary)],
          });
        } else if (proposalType === 'RemoveFellowProposal') {
          target = contracts.addresses.payroll;
          calldata = encodeFunctionData({
            abi: contracts.abi.payroll,
            functionName: 'removeFellow',
            args: [member as `0x${string}`],
          });
        } else if (proposalType === 'UpdateSalaryProposal') {
          target = contracts.addresses.payroll;
          calldata = encodeFunctionData({
            abi: contracts.abi.payroll,
            functionName: 'updateSalary',
            args: [member as `0x${string}`, parseEther(salary)],
          });
        } else {
          target = contracts.addresses.donationController;
          calldata = encodeFunctionData({
            abi: contracts.abi.donationController,
            functionName: 'setMinimumDonation',
            args: [parseEther(minimumDonation)],
          });
        }

        await walletClient.writeContract({
          account,
          address: contracts.addresses.governor,
          abi: contracts.abi.governor,
          functionName: 'propose',
          args: [[target], [0n], [calldata], description],
        });

        setMessage('Proposal submitted. Mine blocks if you want to move it into voting.');
      })().catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Proposal creation failed');
      });
    });
  };

  return (
    <div className="panel">
      <div className="panelHeader">
        <h3>Create Proposal</h3>
      </div>
      <div className="gridTwo">
        <label className="field">
          <span>Proposal type</span>
          <select value={proposalType} onChange={(event) => setProposalType(event.target.value as ExtendedProposalType)}>
            <option value="GrantProposal">Grant Proposal</option>
            <option value="AddFellowProposal">Add Fellow Proposal</option>
            <option value="RemoveFellowProposal">Remove Fellow Proposal</option>
            <option value="UpdateSalaryProposal">Update Salary Proposal</option>
            <option value="UpdateMinimumDonationProposal">Update Minimum Donation Proposal</option>
          </select>
        </label>

        <label className="field">
          <span>Description</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>

        <label className="field">
          <span>Fellow member</span>
          <input value={member} onChange={(event) => setMember(event.target.value)} />
        </label>

        <label className="field">
          <span>Grant recipient</span>
          <input value={recipient} onChange={(event) => setRecipient(event.target.value)} />
        </label>

        <label className="field">
          <span>Grant amount (DOT)</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" step="0.01" />
        </label>

        <label className="field">
          <span>Monthly salary (DOT)</span>
          <input value={salary} onChange={(event) => setSalary(event.target.value)} type="number" step="0.01" />
        </label>

        <label className="field">
          <span>Minimum donation (DOT)</span>
          <input
            value={minimumDonation}
            onChange={(event) => setMinimumDonation(event.target.value)}
            type="number"
            min="1"
            step="0.01"
          />
        </label>
      </div>
      <div className="stackSm">
        <button className="button" onClick={submit}>
          Submit Proposal
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </div>
    </div>
  );
}
