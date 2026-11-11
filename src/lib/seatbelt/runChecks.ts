import type {
  AllCheckResults,
  ProposalCheck,
  ProposalData,
  ProposalEvent,
  TenderlySimulation,
} from "./types";

/**
 * Runs every check against a simulated proposal. A check that throws is reported as an error
 * row for that check instead of failing the whole simulation report.
 */
export async function runChecks(
  checks: { [checkId: string]: ProposalCheck },
  proposal: ProposalEvent,
  sim: TenderlySimulation,
  deps: ProposalData
): Promise<AllCheckResults> {
  const entries = await Promise.all(
    Object.keys(checks).map(async (checkId) => {
      const check = checks[checkId];
      try {
        const result = await check.checkProposal(proposal, sim, deps);
        return [checkId, { name: check.name, result }] as const;
      } catch (error) {
        console.error(`Simulation check "${checkId}" failed:`, error);
        const message = error instanceof Error ? error.message : String(error);
        return [
          checkId,
          {
            name: check.name,
            result: {
              info: [],
              warnings: [],
              errors: [`Check failed to run: ${message}`],
            },
          },
        ] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}
