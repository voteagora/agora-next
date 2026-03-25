import Tenant from "@/lib/tenant/tenant";
import { GovernorInstance, TenantContracts } from "@/lib/types";

/**
 * Get all governor instances for the current tenant.
 * If the tenant has a `governors` array, return it.
 * Otherwise, synthesize a single-element array from the legacy singular fields.
 */
export function getGovernorInstances(
  contracts?: TenantContracts
): GovernorInstance[] {
  const c = contracts ?? Tenant.current().contracts;

  if (c.governors && c.governors.length > 0) {
    return c.governors;
  }

  // Fallback: wrap the singular governor/timelock/token into a GovernorInstance
  return [
    {
      id: "default",
      label: "Governor",
      governor: c.governor,
      timelock: c.timelock,
      token: c.token,
      governorType: c.governorType,
      timelockType: c.timelockType,
      proposalTypesConfigurator: c.proposalTypesConfigurator,
      alligator: c.alligator,
      treasury: c.treasury,
    },
  ];
}

/**
 * Resolve a GovernorInstance by its governor contract address.
 * Used to find the correct governor/timelock/token for a given proposal.
 */
export function getGovernorByAddress(
  governorAddress: string,
  contracts?: TenantContracts
): GovernorInstance | undefined {
  const instances = getGovernorInstances(contracts);
  return instances.find(
    (g) =>
      g.governor.address.toLowerCase() === governorAddress.toLowerCase()
  );
}

/**
 * Resolve a GovernorInstance by its id (e.g., "main", "treasury").
 */
export function getGovernorById(
  id: string,
  contracts?: TenantContracts
): GovernorInstance | undefined {
  const instances = getGovernorInstances(contracts);
  return instances.find((g) => g.id === id);
}

/**
 * Get all governor contract addresses for the current tenant.
 * Useful for DB queries that need to fetch proposals across all governors.
 */
export function getAllGovernorAddresses(
  contracts?: TenantContracts
): string[] {
  const instances = getGovernorInstances(contracts);
  return instances.map((g) => g.governor.address);
}

/**
 * Get the default (primary) governor instance.
 * This is the first governor in the array.
 */
export function getDefaultGovernor(
  contracts?: TenantContracts
): GovernorInstance {
  const instances = getGovernorInstances(contracts);
  return instances[0];
}
