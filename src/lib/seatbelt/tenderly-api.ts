import { getAddress } from "@ethersproject/address";

import type { TenderlyPayload, TenderlySimulation } from "./types";

export const BLOCK_GAS_LIMIT = 30_000_000;

export const DEFAULT_SIMULATION_FROM =
  "0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073";

export const TENDERLY_API_BASE_URL = "https://api.tenderly.co/api/v1";

export function getTenderlyAccessKey(): string {
  return (
    process.env.TENDERLY_ACCESS_KEY ?? process.env.TENDERLY_ACCESS_TOKEN ?? ""
  );
}

export function getTenderlyUser(): string {
  return process.env.TENDERLY_USER ?? "";
}

export function getTenderlyProjectSlug(): string {
  return (
    process.env.TENDERLY_PROJECT ?? process.env.TENDERLY_PROJECT_SLUG ?? ""
  );
}

export function getTenderlySimUrl(): string {
  const user = getTenderlyUser();
  const project = getTenderlyProjectSlug();
  return `${TENDERLY_API_BASE_URL}/account/${user}/project/${project}/simulate`;
}

export function getTenderlyEncodeUrl(): string {
  const user = getTenderlyUser();
  const project = getTenderlyProjectSlug();
  return `${TENDERLY_API_BASE_URL}/account/${user}/project/${project}/contracts/encode-states`;
}

export const tenderlyFetchHeaders = (): Record<string, string> => ({
  "X-Access-Key": getTenderlyAccessKey(),
});

type TenderlyError = {
  statusCode?: number;
};

function truncateForLog(s: string, max = 1500): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

export async function sendSimulation(
  payload: TenderlyPayload,
  delayMs = 1000
): Promise<TenderlySimulation> {
  try {
    const response = await fetch(getTenderlySimUrl(), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: tenderlyFetchHeaders(),
    });

    const sim = (await response.json()) as TenderlySimulation & {
      error?: unknown;
    };

    if (!response.ok) {
      throw new Error(
        `Tenderly simulate HTTP ${response.status}: ${truncateForLog(JSON.stringify(sim))}`
      );
    }

    if (!sim?.simulation?.id) {
      throw new Error(
        `Tenderly simulate response missing simulation.id: ${truncateForLog(JSON.stringify(sim))}`
      );
    }

    await fetch(
      `${TENDERLY_API_BASE_URL}/account/${getTenderlyUser()}/project/${getTenderlyProjectSlug()}/simulations/${sim.simulation.id}/share`,
      {
        method: "POST",
        headers: tenderlyFetchHeaders(),
      }
    );

    sim.transaction.addresses = sim.transaction.addresses.map(getAddress);
    for (const contract of sim.contracts) {
      contract.address = getAddress(contract.address);
    }

    return sim;
  } catch (err) {
    const is429 = (err as TenderlyError)?.statusCode === 429;
    if (delayMs > 8000 || !is429) {
      console.warn(
        "Simulation request failed with the below request payload and error"
      );
      throw err;
    }
    console.warn(err);
    console.warn(
      `Simulation request failed with the above error, retrying in ~${delayMs} milliseconds. See request payload below`
    );
    console.log(JSON.stringify(payload));
    await delay(delayMs + randomInt(0, 1000));
    return await sendSimulation(payload, delayMs * 2);
  }
}
