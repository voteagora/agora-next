import { toUtf8Bytes } from "ethers";
import {
  toHex,
  keccak256,
  getAddress,
  pad,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import {
  mainnet,
  sepolia,
  optimism,
  scroll,
  base,
  arbitrum,
} from "viem/chains";
import { getPublicClient } from "../viem";
import { StorageEncodingResponse } from "./types";

// --- Type Definitions ---

interface StorageVariable {
  astId: number;
  contract: string;
  label: string;
  offset: string;
  slot: string;
  type: string;
}

interface StorageLayout {
  storage: StorageVariable[];
  types: { [typeId: string]: any };
}

interface OverridePayload {
  networkID: string;
  stateOverrides: {
    [contractAddr: string]: {
      value: { [prop: string]: any };
    };
  };
}

// --- Helper Functions ---

/**
 * Parses property strings in the format:
 *   [_]<mappingName>[<key>][.<field1>[<index>]][.<field2>...]
 *   OR
 *   <variableName>
 *
 * Examples:
 *   _proposals[62644281...].voteEnd._deadline
 *   proposals[84].values.length
 *   proposals[84].values[0]
 *   proposalCount
 */
function parsePropertyString(
  propStr: string
): { mappingName: string; key?: string; chain: string[] } | null {
  const mappingRegex = /^_?(\w+)\[([^\]]+)\](.*)$/;
  const mappingMatch = propStr.match(mappingRegex);

  if (mappingMatch) {
    const mappingName = mappingMatch[1];
    const key = mappingMatch[2];
    const rest = mappingMatch[3];

    const chain: string[] = [];
    if (rest) {
      let parts = rest.startsWith(".") ? rest.slice(1) : rest;
      let currentPart = "";
      let inArrayAccess = false;

      for (let i = 0; i < parts.length; i++) {
        const char = parts[i];
        if (char === "[") {
          if (currentPart) {
            chain.push(currentPart);
          }
          inArrayAccess = true;
          currentPart = "";
        } else if (char === "]") {
          inArrayAccess = false;
          chain.push(`[${currentPart}]`);
          currentPart = "";
        } else if (char === "." && !inArrayAccess) {
          if (currentPart) {
            chain.push(currentPart);
          }
          currentPart = "";
        } else {
          currentPart += char;
        }
      }

      if (currentPart) {
        chain.push(currentPart);
      }
    }

    return { mappingName, key, chain };
  }

  const variableRegex = /^[a-zA-Z_]\w*$/;
  if (variableRegex.test(propStr)) {
    return { mappingName: propStr, chain: [] };
  }

  return null;
}

/**
 * Returns the storage variable info from the layout for a given variable name.
 */
function getStorageVariable(
  storageLayout: StorageLayout,
  variableName: string
): StorageVariable | undefined {
  return storageLayout.storage.find(
    (item) => item.label === variableName || item.label === "_" + variableName
  );
}

/**
 * Returns the type definition object from the layout's types.
 */
function getTypeDefinition(storageLayout: StorageLayout, typeId: string): any {
  return storageLayout.types[typeId];
}

/**
 * Dynamically computes the storage slot for a property string using
 * the provided storage layout.
 *
 * For mappings:
 *   slot = keccak256(abi.encode(key, mappingVariable.slot))
 *
 * For arrays:
 *   length: stored at slot p
 *   data: starts at keccak256(p)
 *   element i: stored at keccak256(p) + i
 */
function computeDynamicStorageSlot(
  storageLayout: StorageLayout,
  propStr: string
): string {
  const parsed = parsePropertyString(propStr);
  if (!parsed) {
    throw new Error(`Invalid property format: ${propStr}`);
  }
  const { mappingName, key, chain } = parsed;

  const variable = getStorageVariable(storageLayout, mappingName);
  if (!variable) {
    throw new Error(`Storage variable "${mappingName}" not found in layout`);
  }

  if (!key) {
    // Convert the slot string to a number first, then to hex
    const slotNumber = BigInt(variable.slot);
    const slot = pad(toHex(slotNumber), { size: 32 });
    return slot;
  }

  const baseSlotBN = BigInt(variable.slot);
  const mappingTypeDef = getTypeDefinition(storageLayout, variable.type);
  if (!mappingTypeDef || mappingTypeDef.encoding !== "mapping") {
    throw new Error(`${mappingName} is not a mapping in the storage layout`);
  }

  const keyAbiType = mappingTypeDef.key === "t_bytes32" ? "bytes32" : "uint256";
  let keyValue: bigint | `0x${string}`;
  try {
    if (mappingTypeDef.key === "t_bytes32") {
      const hexKey = key.startsWith("0x") ? key : `0x${key}`;
      keyValue = (
        hexKey.length === 66 ? hexKey : `0x${hexKey.slice(2).padStart(64, "0")}`
      ) as `0x${string}`;
    } else {
      keyValue = BigInt(key);
    }
  } catch (e) {
    throw new Error(`Invalid key "${key}" for mapping "${mappingName}"`);
  }

  const encoded = encodeAbiParameters(
    parseAbiParameters([keyAbiType, "uint256"]),
    [keyValue, baseSlotBN]
  );
  let currentSlotBN = BigInt(keccak256(encoded));
  let currentTypeId = mappingTypeDef.value;

  for (let i = 0; i < chain.length; i++) {
    const part = chain[i];

    // Handle array access [index]
    if (part.startsWith("[") && part.endsWith("]")) {
      const index = parseInt(part.slice(1, -1));
      const arrayTypeDef = getTypeDefinition(storageLayout, currentTypeId);

      if (!arrayTypeDef) {
        throw new Error(`Type ${currentTypeId} not found in storage layout`);
      }

      // For dynamic arrays, compute keccak256(slot) + index
      if (arrayTypeDef.encoding === "dynamic_array") {
        const arrayDataSlot = keccak256(
          pad(toHex(currentSlotBN), { size: 32 })
        );
        currentSlotBN = BigInt(arrayDataSlot) + BigInt(index);
        currentTypeId = arrayTypeDef.base;
      } else {
        currentSlotBN = currentSlotBN + BigInt(index);
        currentTypeId = arrayTypeDef.base;
      }
      continue;
    }

    // Handle array length access
    if (part === "length") {
      const typeDef = getTypeDefinition(storageLayout, currentTypeId);
      if (!typeDef || !typeDef.encoding.includes("array")) {
        throw new Error(
          `Cannot access length of non-array type ${currentTypeId}`
        );
      }
      return pad(toHex(currentSlotBN), { size: 32 });
    }

    // Handle struct field access
    const typeDef = getTypeDefinition(storageLayout, currentTypeId);
    if (!typeDef) {
      throw new Error(`Type ${currentTypeId} not found in storage layout`);
    }

    // Handle both tuple and struct types
    if (typeDef.encoding === "tuple" || typeDef.encoding === "struct") {
      const member = typeDef.members.find(
        (m: any) => m.label === part || m.label === "_" + part
      );
      if (!member) {
        throw new Error(`Member "${part}" not found in type ${currentTypeId}`);
      }

      currentSlotBN = currentSlotBN + BigInt(member.slot);
      currentTypeId = member.type;
      continue;
    }

    // Handle regular struct fields
    if (!typeDef.members) {
      throw new Error(
        `Type ${currentTypeId} does not have members; cannot access ${part}`
      );
    }

    const member = typeDef.members.find(
      (m: any) => m.label === part || m.label === "_" + part
    );
    if (!member) {
      throw new Error(`Member "${part}" not found in type ${currentTypeId}`);
    }

    currentSlotBN = currentSlotBN + BigInt(member.slot);
    currentTypeId = member.type;
  }

  return pad(toHex(currentSlotBN), { size: 32 });
}

/**
 * Converts an override value into a 32-byte hex string.
 */
function to32ByteHex(value: any): string {
  // Handle null/undefined/empty string
  if (value === null || value === undefined || value === "") {
    return "0x" + "0".repeat(64);
  }

  // Handle booleans - return 32 bytes with just the last byte set to 0 or 1
  if (typeof value === "boolean") {
    return "0x" + "0".repeat(62) + (value ? "01" : "00");
  }

  // Handle numbers and numeric strings
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(Number(value)))
  ) {
    // Convert to BigInt to handle large numbers correctly
    const bigIntValue = BigInt(value);
    // Convert to hex and ensure it's padded to 32 bytes (64 hex characters)
    return "0x" + bigIntValue.toString(16).padStart(64, "0");
  }

  // Handle strings
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      // For function calls or other data that might be longer than 32 bytes,
      // return as is without padding
      if (value.length > 66) {
        return value;
      }
      // For shorter hex strings, pad to 32 bytes
      return "0x" + value.slice(2).padStart(64, "0");
    }

    if (value.toLowerCase() === "false") {
      return "0x" + "0".repeat(62) + "00";
    }
    if (value.toLowerCase() === "true") {
      return "0x" + "0".repeat(62) + "01";
    }

    return keccak256(toUtf8Bytes(value));
  }

  // Handle byte arrays - if longer than 32 bytes, return as is
  if (value instanceof Uint8Array) {
    const hex = toHex(value);
    // For function calls or other data that might be longer than 32 bytes,
    // return as is without padding
    if (hex.length > 66) {
      return hex;
    }
    // For shorter byte arrays, pad to 32 bytes
    return "0x" + hex.slice(2).padStart(64, "0");
  }

  // Default case: convert to string and hash
  const str = String(value);
  if (str === "") {
    return "0x" + "0".repeat(64);
  }
  return keccak256(toUtf8Bytes(str));
}

/**
 * Attempts to fetch storage layout from Sourcify v2
 */
async function fetchStorageLayoutFromSourcify(
  contractAddress: string,
  networkID: string
): Promise<StorageLayout | null> {
  const sourcifyEndpoint = "https://sourcify.dev/server";

  const url = `${sourcifyEndpoint}/v2/contract/${networkID}/${contractAddress}?fields=storageLayout,metadata`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Contract ${contractAddress} not found on Sourcify`);
        return null;
      }
      throw new Error(`Sourcify API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.storageLayout) {
      return data.storageLayout;
    }

    if (data?.metadata?.output?.storageLayout) {
      return data.metadata.output.storageLayout;
    }

    return null;
  } catch (e) {
    console.error("Error fetching from Sourcify:", e);
    return null;
  }
}

/**
 * Fetches the storage layout for a verified contract using multiple sources.
 */
async function fetchStorageLayout(
  contractAddress: string,
  networkID: string
): Promise<StorageLayout | null> {
  const chains = {
    "1": mainnet,
    "11155111": sepolia,
    "10": optimism,
    "534352": scroll,
    "8453": base,
    "42161": arbitrum,
  };

  const chain = chains[networkID as keyof typeof chains];
  if (!chain) {
    console.error(`Network ${networkID} not supported`);
    return null;
  }

  const client = getPublicClient();

  // Check for proxy implementation
  const proxySlots = [
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  ] as const;

  for (const slot of proxySlots) {
    try {
      const storageValue = await client.getStorageAt({
        address: getAddress(contractAddress),
        slot,
      });

      const storageValueBigInt = BigInt(storageValue ?? "0x0");
      if (storageValueBigInt && storageValueBigInt !== 0n) {
        const implAddress = "0x" + storageValueBigInt.toString(16).slice(-40);
        if (
          !implAddress.match(/^0x[0-9a-fA-F]{40}$/) ||
          implAddress.includes("000000000000000")
        ) {
          continue;
        }
        try {
          return fetchStorageLayout(getAddress(implAddress), networkID);
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.error("Error checking for proxy:", e);
    }
  }

  // Try Sourcify
  try {
    const sourcifyLayout = await fetchStorageLayoutFromSourcify(
      contractAddress,
      networkID
    );
    if (sourcifyLayout) {
      return sourcifyLayout;
    }
  } catch (e) {
    console.error("Error fetching from Sourcify:", e);
  }

  // Try Etherscan
  const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!etherscanApiKey) {
    console.log("No Etherscan API key found, skipping Etherscan attempt");
    return null;
  }

  const endpoints: { [key: string]: string } = {
    "1": "https://api.etherscan.io/api",
    "11155111": "https://api-sepolia.etherscan.io/api",
    "10": "https://api-optimistic.etherscan.io/api",
    "534352": "https://api.scrollscan.com/api",
    "8453": "https://api.basescan.org/api",
    "42161": "https://api.arbiscan.io/api",
  };

  const baseUrl = endpoints[networkID];
  if (!baseUrl) {
    console.error(`Network ${networkID} not supported by Etherscan`);
    return null;
  }

  const url = `${baseUrl}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${etherscanApiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "1") {
    console.error(`Etherscan API error for ${contractAddress}: ${data.result}`);
    return null;
  }

  let result = data.result[0];

  // --- Handle Proxies ---
  if (result.Proxy && result.Proxy === "1") {
    let implAddress = result.Implementation;
    if (!implAddress || implAddress === "") {
      const slot =
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;
      const storageValue = await client.getStorageAt({
        address: getAddress(contractAddress),
        slot,
      });
      if (storageValue) {
        const storageValueBigInt = BigInt(storageValue);
        implAddress = getAddress(
          "0x" + storageValueBigInt.toString(16).slice(-40)
        );
      }
    }
    if (implAddress) {
      return fetchStorageLayout(implAddress, networkID);
    }
  }

  // Fourth try: Use Etherscan Metadata (if available)
  if (result.Metadata) {
    try {
      const metadata = JSON.parse(result.Metadata);
      if (metadata.output && metadata.output.storageLayout) {
        return metadata.output.storageLayout;
      }
    } catch (e) {
      console.error(
        "Error parsing Metadata from Etherscan, falling back to source code",
        e
      );
    }
  }

  // If we get here, we couldn't get the storage layout through normal means
  console.error(
    "No storage layout found through any method, will use fallback"
  );
  return null;
}

export const encodeState = async ({
  networkID,
  stateOverrides,
}: OverridePayload): Promise<StorageEncodingResponse> => {
  try {
    if (!networkID) {
      throw new Error("networkID is required");
    }
    if (!stateOverrides) {
      throw new Error("stateOverrides is required");
    }

    const output: StorageEncodingResponse = { stateOverrides: {} };

    for (const contractAddr in stateOverrides) {
      try {
        let storageLayout = await fetchStorageLayout(contractAddr, networkID);

        output.stateOverrides[contractAddr] = { value: {} };
        const state = stateOverrides[contractAddr].value;

        for (const prop in state) {
          try {
            if (!storageLayout) {
              throw new Error("No storage layout found");
            }

            const slot = computeDynamicStorageSlot(storageLayout, prop);

            const hexValue = to32ByteHex(state[prop]);

            output.stateOverrides[contractAddr].value![slot] = hexValue;
          } catch (err: any) {
            console.error("Error processing property", prop, err);
          }
        }
      } catch (e: any) {
        console.error(`Error handling contract ${contractAddr}:`, e);
      }
    }
    return output;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
