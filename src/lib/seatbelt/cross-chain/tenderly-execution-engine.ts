import { sendSimulation } from "../tenderly-api";
import type {
  CrossChainExecutionJobResult,
  CrossChainExecutionStepResult,
  SimulationResult,
} from "../types";
import { BridgeKind } from "../types";
import { collectCrossChainJobs } from "./adapter";
import { isChainSimulationSupported } from "./capabilities";

export type CrossChainExecutionOptions = {
  disabled?: boolean;
};

export async function handleCrossChainSimulations(
  source: SimulationResult,
  options: CrossChainExecutionOptions = {}
): Promise<SimulationResult> {
  if (options.disabled || !source.sim.transaction.status) {
    return source;
  }

  const simulationTimestamp =
    source.simulationTimestamp ?? BigInt(source.latestBlock.timestamp);

  const calldatas = source.proposal?.calldatas;
  if (!calldatas?.length) {
    return { ...source, simulationTimestamp };
  }

  const planned = collectCrossChainJobs(calldatas);

  if (planned.length === 0) {
    return { ...source, simulationTimestamp };
  }

  const destinationJobResults: CrossChainExecutionJobResult[] = [];
  const destinationStateByChain: Record<string, Record<string, unknown>> = {};
  let crossChainFailure = false;

  const ctx = { simulationTimestamp };

  for (const job of planned) {
    if (job.bridge === BridgeKind.WORMHOLE) {
      destinationJobResults.push({
        bridge: job.bridge,
        destinationChainId: job.destinationChainId,
        sourceActionIndex: job.sourceActionIndex,
        steps: [
          {
            label: "wormhole_follow_up",
            ok: true,
            skipped: true,
            skipReason:
              "Wormhole destination simulation is not implemented in-tree (publishMessage detected)",
          },
        ],
      });
      continue;
    }

    if (!isChainSimulationSupported(job.destinationChainId)) {
      destinationJobResults.push({
        bridge: job.bridge,
        destinationChainId: job.destinationChainId,
        sourceActionIndex: job.sourceActionIndex,
        steps: [
          {
            label: "destination_chain",
            ok: true,
            skipped: true,
            skipReason: `Chain ${job.destinationChainId} not supported for follow-up simulation`,
          },
        ],
      });
      continue;
    }

    const stepsOut: CrossChainExecutionStepResult[] = [];

    for (const step of job.steps) {
      try {
        const payload = step.buildPayload(ctx);
        const nestedSimulation = await sendSimulation(payload);
        const ok = nestedSimulation.transaction.status;
        if (!ok) crossChainFailure = true;
        stepsOut.push({
          label: step.label,
          ok,
          tenderlySimulationId: nestedSimulation.simulation.id,
          nestedSimulation,
        });
        const chainKey = String(job.destinationChainId);
        const txInfo = nestedSimulation.transaction.transaction_info;
        if (txInfo?.state_diff?.length) {
          destinationStateByChain[chainKey] = {
            ...(destinationStateByChain[chainKey] ?? {}),
            [`step:${step.label}`]: txInfo.state_diff,
          };
        }
      } catch (e) {
        crossChainFailure = true;
        stepsOut.push({
          label: step.label,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    destinationJobResults.push({
      bridge: job.bridge,
      destinationChainId: job.destinationChainId,
      sourceActionIndex: job.sourceActionIndex,
      steps: stepsOut,
    });
  }

  return {
    ...source,
    simulationTimestamp,
    destinationJobResults,
    destinationStateByChain,
    crossChainFailure,
  };
}
