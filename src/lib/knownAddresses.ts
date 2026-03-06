/**
 * Known addresses for Pretty view rendering in proposal transactions.
 * All addresses must be lowercase for consistent lookups.
 *
 * Sources:
 * - Ethereum Mainnet addresses from protocol-fees repo
 * - Standard Uniswap/Ethereum contracts
 */

export const KNOWN_ADDRESSES: Record<string, string> = {
  // EAS (Ethereum Attestation Service)
  "0xa1207f3bba224e2c9c3c6d5af63d0eb1582ce587": "EAS Attestation Service",

  // UNI Token
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI Token",

  // Burn Address
  "0x000000000000000000000000000000000000dead": "Burn Address",

  // Uniswap V3 Factory
  "0x1f98431c8ad98523631ae4a59f267346ea31f984": "Uniswap V3 Factory",

  // Uniswap V2 Factory
  "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": "Uniswap V2 Factory",

  // Uniswap V2 FeeToSetter (Governance Timelock)
  "0x18e433c7bf8a2e1d0197ce5d8f9afada1a771360": "Uniswap V2 FeeToSetter",

  // Governance Timelock
  "0x1a9c8182c09f50c8318d769245bea52c32be35bc": "Governance Timelock",

  // Protocol Fees Ethereum Mainnet - from protocol-fees README
  "0xd3aa12b99892b7d95bbaa27aef222a8e2a038c0c": "MainnetDeployer",
  "0xf38521f130fccf29db1961597bc5d2b60f995f85": "Token Jar",
  "0x0d5cd355e2abeb8fb1552f56c965b867346d6721": "Releaser (Firepit)",
  "0x5e74c9f42eed283bff3744fbd1889d398d40867d": "Uniswap V3 Fee Adapter",
  "0xf2371551fe3937db7c750f4dfabe5c2fffdcbf5a": "V3OpenFeeAdapter",
  "0xca046a83edb78f74ae338bb5a291bf6fdac9e1d2": "UNI Vester",
  "0xc707467e7fb43fe7cc55264f892dd2d7f8fc27c8": "Agreement Anchor 1",
  "0x33a56942fe57f3697fe0ff52ab16cb0ba9b8eadd": "Agreement Anchor 2",
  "0xf9f85a17cc6de9150cd139f64b127976a1de91d1": "Agreement Anchor 3",
};

/**
 * Schema UIDs that are known and can be displayed with friendly names.
 * These are bytes32 values, stored lowercase without 0x prefix for consistent lookups.
 */
export const KNOWN_SCHEMAS: Record<string, string> = {
  "504f10498bcdb19d4960412dbade6fa1530b8eed65c319f15cbe20fadafe56bd":
    "DUNI Agreement EAS Schema",
};

/**
 * Get a friendly name for an address if known, otherwise return null.
 */
export function getFriendlyName(address: string): string | null {
  const normalized = address.toLowerCase();
  return KNOWN_ADDRESSES[normalized] ?? null;
}

/**
 * Check if an address has a known friendly name.
 */
export function hasFriendlyName(address: string): boolean {
  const normalized = address.toLowerCase();
  return normalized in KNOWN_ADDRESSES;
}

/**
 * Get a friendly name for a schema UID if known, otherwise return null.
 */
export function getSchemaName(schemaUid: string): string | null {
  const normalized = schemaUid.toLowerCase().replace(/^0x/, "");
  return KNOWN_SCHEMAS[normalized] ?? null;
}

/**
 * Check if a schema UID has a known friendly name.
 */
export function hasSchemaName(schemaUid: string): boolean {
  const normalized = schemaUid.toLowerCase().replace(/^0x/, "");
  return normalized in KNOWN_SCHEMAS;
}
