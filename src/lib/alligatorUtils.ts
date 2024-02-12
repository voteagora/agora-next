import {
  AuthorityChainRules,
  AuthorityChainsSnaps,
} from "@/app/api/common/authority-chains/authorityChains";
import { OptimismContracts } from "./contracts/contracts";

export async function getProxyAddress(address: string, namespace: "optimism") {
  switch (namespace) {
    case "optimism": {
      return OptimismContracts.alligator.contract.proxyAddress(address);
    }
    default: {
      throw new Error("Can't find Agora Instance token");
    }
  }
}

export const validateChain =
  (chain: AuthorityChainsSnaps, latestBlockNumber: number) => () =>
    (chain.rules as AuthorityChainRules[]).every((rule) => {
      if (rule?.not_valid_after && rule.not_valid_after > latestBlockNumber) {
        return false;
      }
      if (rule?.not_valid_before && rule.not_valid_before < latestBlockNumber) {
        return false;
      }
      if (
        rule?.blocks_before_vote_closes &&
        rule.blocks_before_vote_closes < latestBlockNumber
      ) {
        return false;
      }
      return true;
    });

export function getTotalVotableAllowance(
  chains: string[][],
  rules: AuthorityChainRules[][],
  balances: number[],
  latestBlockNumber: number
) {
  const allowances = Array.from(balances);

  const drainedAmount = new Map();

  chains.forEach((chain, i) => {
    const chainRules = rules[i].reverse();

    chain.reverse().forEach((address, j) => {
      const rule = chainRules[j];

      if (rule.max_redelegations < j) {
        allowances[i] = 0;
      }

      if (allowances[i] === 0) {
        return;
      }

      if (rule?.not_valid_after && rule.not_valid_after > latestBlockNumber) {
        allowances[i] = 0;
        return;
      }

      if (rule?.not_valid_before && rule.not_valid_before < latestBlockNumber) {
        allowances[i] = 0;
        return;
      }

      if (
        rule?.blocks_before_vote_closes &&
        rule.blocks_before_vote_closes < latestBlockNumber
      ) {
        allowances[i] = 0;
        return;
      }

      if (rule.allowance_type === 1) {
        allowances[i] =
          (allowances[i] * Math.max(rule.allowance, 1000000)) / 1000000;
      } else {
        // prevent double spent
        const drained = drainedAmount.get(address) || 0;
        allowances[i] = Math.min(allowances[i], rule.allowance - drained);
        drainedAmount.set(address, allowances[i] + drained);
      }
    });
  });

  return allowances.reduce((a, b) => a + b, 0);
}
