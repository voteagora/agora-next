import { fetchVotesForProposalAndDelegate } from "../common/votes/getVotes";
import { fetchVotingPowerForProposal } from "@/app/api/common/voting-power/getVotingPower";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchAuthorityChains } from "@/app/api/common/authority-chains/getAuthorityChains";
import { cache } from "react";
import fs from "fs";
import path from "path";

type Timing = {
  label: string;
  ms: number;
  ok: boolean;
  error?: string;
};

async function timed<T>(label: string, timings: Timing[], fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const val = await fn();
    const ms = Date.now() - start;
    timings.push({ label, ms, ok: true });
    console.log("getAllForVoting timing:", label, { ms });
    return val;
  } catch (e: any) {
    const ms = Date.now() - start;
    const errMsg = e?.message ?? String(e);
    timings.push({ label, ms, ok: false, error: errMsg });
    console.error("getAllForVoting timing (error):", label, { ms, error: errMsg });
    throw e;
  }
}

async function appendTimingToFile(record: any) {
  try {
    const profilingDir = path.join(process.cwd(), "profiling");
    const filePath = path.join(profilingDir, "getAllForVoting.ndjson");
    if (!fs.existsSync(profilingDir)) {
      fs.mkdirSync(profilingDir, { recursive: true });
    }
    const line = JSON.stringify(record) + "\n";
    await fs.promises.appendFile(filePath, line, { encoding: "utf8" });
  } catch (err) {
    console.error("Failed to append timings to file", err);
  }
}

async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposalId: string
) {
  const timings: Timing[] = [];
  const totalStart = Date.now();
  const results = await Promise.allSettled([
    timed("fetchVotingPowerForProposal", timings, () =>
      fetchVotingPowerForProposal({
        addressOrENSName: address,
        blockNumber,
        proposalId,
      })
    ),
    timed("fetchAuthorityChains", timings, () => fetchAuthorityChains({ address, blockNumber })),
    timed("fetchDelegate", timings, () => fetchDelegate(address)),
    timed("fetchVotesForProposalAndDelegate", timings, () =>
      fetchVotesForProposalAndDelegate({ proposalId, address })
    ),
  ]);
  const totalMs = Date.now() - totalStart;
  console.log("getAllForVoting total duration", { ms: totalMs });

  // Fire-and-forget append (await once to ensure persistence before responding)
  await appendTimingToFile({
    ts: new Date().toISOString(),
    address,
    blockNumber,
    proposalId,
    totalMs,
    timings,
  });

  const votingPower =
    results[0].status === "fulfilled" ? results[0].value : null;
  const authorityChains =
    results[1].status === "fulfilled" ? results[1].value : null;
  const delegate = results[2].status === "fulfilled" ? results[2].value : null;
  const votesForProposalAndDelegate =
    results[3].status === "fulfilled" ? results[3].value : null;

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}

export const fetchAllForVoting = cache(getAllForVoting);
