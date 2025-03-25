import { BigNumber } from '@ethersproject/bignumber';
import type { BigNumber as BigNumberType } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { formatEther } from '@ethersproject/units';
import type { ProposalCheck } from '../types';

/**
 * Reports on whether the caller initiating the `execute` call needs to send ETH with the call.
 */
export const checkValueRequired: ProposalCheck = {
  name: 'Reports on whether the caller needs to send ETH with the call',
  async checkProposal(proposal, sim, _) {
    // TODO Fix typings for values. The `values` field is not always present in the proposal object,
    // but key `3` contains them. (Similarly key 0 is proposal ID, 1 is proposer, etc.). This is
    // related to why we use `proposalCreatedEvent.args![3]` in `tenderly.ts`.
    type ProposalValues = { '3': BigNumberType[] };
    const totalValue = proposal.values
      ? // For local simulations, `values` exists and `3` does not.
        proposal.values.reduce((sum, cur) => sum.add(cur), Zero)
      : // For simulations read from the chain, `3` exists and `values` does not.
        (proposal as unknown as ProposalValues)['3'].reduce((sum, cur) => sum.add(cur), Zero);

    const txValue = BigNumber.from(sim.simulation.value);
    if (txValue.eq(Zero)) {
      const msg = 'No ETH is required to be sent by the account that executes this proposal.';
      return { info: [msg], warnings: [], errors: [] };
    }

    const valueRequired = formatEther(totalValue);
    const valueSent = formatEther(txValue);

    // For governance proposals with ETH transfers, the flow is:
    // caller -> governor -> timelock -> target
    const msg1 =
      'The account that executes this proposal will need to send ETH along with the transaction.';
    const msg2 = `The calls made by this proposal require a total of ${valueRequired} ETH.`;
    const msg3 = `Due to the flow of ETH in governance proposals (caller -> governor -> timelock -> target), the full amount of ${valueSent} ETH must be sent with the transaction.`;

    const msg = `${msg1}\n\n${msg2} ${msg3}`;

    return { info: [], warnings: [msg], errors: [] };
  },
};
