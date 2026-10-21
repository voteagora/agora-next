import { cache } from "react";
import { formatEther, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";

const SPONSOR_PRIVATE_KEY = process.env.GAS_SPONSOR_PK;

// Approximate gas used by a castVoteBySig call. Multiplied by the live gas
// price of the tenant's chain so the estimate is meaningful on L2s (e.g. Base)
// as well as on mainnet.
const CAST_VOTE_BY_SIG_GAS = 110_000n;

async function getRelayStatus() {
  if (!SPONSOR_PRIVATE_KEY || !isHex(SPONSOR_PRIVATE_KEY)) {
    throw new Error("incorrect or missing SPONSOR_PRIVATE_KEY");
  }

  const { ui, contracts } = Tenant.current();
  const publicClient = getPublicClient();
  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY);

  const [balance, gasPrice] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.getGasPrice(),
  ]);

  const gasCostPerVote = gasPrice * CAST_VOTE_BY_SIG_GAS;
  const configuredSponsor = (
    ui.toggle("sponsoredVote")?.config as UIGasRelayConfig | undefined
  )?.sponsorAddress;

  return {
    chain_id: contracts.governor.chain.id,
    sponsor_address: account.address,
    // The UI only offers the gas relay when the address configured in the
    // tenant's sponsoredVote toggle has enough balance, so a mismatch here
    // means the relay will silently fall back to a standard vote.
    matches_tenant_config:
      !!configuredSponsor &&
      configuredSponsor.toLowerCase() === account.address.toLowerCase(),
    balance: Number(formatEther(balance)),
    remaining_votes:
      gasCostPerVote > 0n ? Number(balance / gasCostPerVote) : null,
  };
}

export const apiFetchRelayStatus = cache(getRelayStatus);
