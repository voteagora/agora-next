import provider from "@/app/lib/provider";
import {
  AuhtorityChainsAggregate,
  AuthorityChainRules,
  AuthorityChainsSnaps,
} from "@/app/api/common/authority-chains/authorityChains";
import { OptimismContracts, contracts } from "./contracts/contracts";
import { bigIntMax, bigIntMin } from "./bigintUtils";

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

export async function getTotalVotableAllowance({
  chains,
  rules,
  balances,
  proxies,
  proposalId,
}: AuhtorityChainsAggregate & { proposalId: string }) {
  const latestBlockNumber = await provider.getBlockNumber();
  const weightsCastByProxies = await Promise.all(
    proxies.map((proxy) =>
      contracts("optimism").governor.contract.weightCast(
        proposalId,
        proxy.toString()
      )
    )
  );
  const allowances: bigint[] = new Array(balances.length);

  console.log("allowances", allowances);

  const drainedAmount: Map<string, bigint> = new Map();

  chains.forEach((chain, i) => {
    const chainRules = rules[i].reverse();
    // This accounts for already casted votes
    allowances[i] =
      BigInt(balances[i]?.toFixed(0) ?? 0) - weightsCastByProxies[i];

    console.log("allowances", allowances);

    chain.reverse().forEach((address, j) => {
      const rule = chainRules[j] as AuthorityChainRules;

      if (allowances[i] === 0n) {
        return;
      }

      if (rule.max_redelegations < j) {
        allowances[i] = 0n;
        return;
      }

      if (rule?.not_valid_after && rule.not_valid_after > latestBlockNumber) {
        allowances[i] = 0n;
        return;
      }

      if (rule?.not_valid_before && rule.not_valid_before < latestBlockNumber) {
        allowances[i] = 0n;
        return;
      }

      if (
        rule?.blocks_before_vote_closes &&
        rule.blocks_before_vote_closes < latestBlockNumber
      ) {
        allowances[i] = 0n;
        return;
      }

      if (rule.allowance_type === 1) {
        allowances[i] =
          (allowances[i] * bigIntMin(BigInt(rule.allowance), 100000n)) /
          100000n;
      } else {
        // prevent double spent
        const drained = drainedAmount.get(address.toString()) || 0n;
        allowances[i] = bigIntMin(
          allowances[i],
          BigInt(rule.allowance) - drained
        );
        drainedAmount.set(address.toString(), allowances[i] + drained);
      }
    });
  });

  return allowances.reduce((a, b) => a + b, 0n);
}
