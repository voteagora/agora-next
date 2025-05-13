import { bullet, toAddressLink } from "../report";
import type { ProposalCheck, TenderlySimulation } from "../types";
import { Provider } from "ethers";
import { unstable_cache } from "next/cache";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const getCodeCached = unstable_cache(
  async (provider: Provider, addr: string) => provider.getCode(addr),
  ["provider.getCode"],
  { revalidate: ONE_DAY_IN_SECONDS }
);

/**
 * Check all targets with code are verified on Etherscan
 */
export const checkTargetsVerifiedEtherscan: ProposalCheck = {
  name: "Check all targets are verified on Etherscan",
  async checkProposal(proposal, sim, deps) {
    const uniqueTargets = proposal.targets.filter(
      (addr: string, i: number, targets: string[]) =>
        targets.indexOf(addr) === i
    );
    const info = await checkVerificationStatuses(
      sim,
      uniqueTargets,
      deps.provider
    );
    return { info, warnings: [], errors: [] };
  },
};

/**
 * Check all touched contracts with code are verified on Etherscan
 */
export const checkTouchedContractsVerifiedEtherscan: ProposalCheck = {
  name: "Check all touched contracts are verified on Etherscan",
  async checkProposal(_, sim, deps) {
    const info = await checkVerificationStatuses(
      sim,
      sim.transaction.addresses,
      deps.provider
    );
    return { info, warnings: [], errors: [] };
  },
};

/**
 * For a given simulation response, check verification status of a set of addresses
 */
async function checkVerificationStatuses(
  sim: TenderlySimulation,
  addresses: string[],
  provider: Provider
): Promise<string[]> {
  const settledResults = await Promise.allSettled(
    addresses.map(async (addr) => {
      const status = await checkVerificationStatus(sim, addr, provider);
      const addressLink = toAddressLink(addr);
      return { addressLink, status };
    })
  );

  const info: string[] = [];
  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      const res = result.value;
      if (res.status === "eoa")
        info.push(
          bullet(`${res.addressLink}: EOA (verification not applicable)`)
        );
      else if (res.status === "verified")
        info.push(bullet(`${res.addressLink}: Contract (verified)`));
      else info.push(bullet(`${res.addressLink}: Contract (not verified)`));
    } else {
      console.error(
        "Error checking Etherscan verification status:",
        result.reason
      );
      info.push(
        bullet(`Error processing an address for Etherscan verification.`)
      );
    }
  }
  return info;
}

/**
 * For a given address, check if it's an EOA, a verified contract, or an unverified contract
 */
async function checkVerificationStatus(
  sim: TenderlySimulation,
  addr: string,
  provider: Provider
): Promise<"verified" | "eoa" | "unverified"> {
  // If an address exists in the contracts array, it's verified on Etherscan
  const contract = sim.contracts.find((item) => item.address === addr);
  if (contract) return "verified";
  // Otherwise, check if there's code at the address. Addresses with code not in the contracts array are not verified
  const code = await getCodeCached(provider, addr);
  return code === "0x" ? "eoa" : "unverified";
}
