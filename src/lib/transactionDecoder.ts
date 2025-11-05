import {
  AbiCoder,
  FunctionFragment,
  ParamType,
  BytesLike,
  ethers,
  hexlify,
  getBytes,
} from "ethers";
import { getAddress } from "viem";
import { unstable_cache } from "next/cache";
import { getPublicClient } from "./viem";
import { cachedGetContractAbi } from "./abiUtils";
import { getCanonicalType } from "./utils";

const DEFAULT_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const SIGNATURE_DB_URL = "https://api.openchain.xyz/signature-database/v1/";

interface DecodedParameter {
  name: string;
  type: string;
  value: any;
  components?: DecodedParameter[];
  nestedFunction?: {
    name: string;
    parameters: DecodedParameter[] | Record<string, any>;
  };
}

// -----------------------------------------------------------------------------
// Helpers for hex encoding/decoding, offsets, and formatting
// -----------------------------------------------------------------------------

const decodeHex = (data: BytesLike): Uint8Array => {
  try {
    return getBytes(data);
  } catch (error) {
    console.error(
      "Invalid hex input:",
      typeof data === "string" ? data.substring(0, 50) + "..." : String(data)
    );
    // Return empty array instead of throwing to prevent crashes
    return new Uint8Array(0);
  }
};

const tryParseOffset = (data: Uint8Array, pos: number): number | null => {
  const word = data.slice(pos, pos + 32);
  if (word.length === 0) return null;
  const bigOffset = BigInt(hexlify(word));
  if (bigOffset > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  const offset = Number(bigOffset);
  if (offset <= pos || offset >= data.length) return null;
  if (offset % 32 !== 0) return null;
  return offset;
};

const tryParseLength = (data: Uint8Array, offset: number): number | null => {
  const word = data.slice(offset, offset + 32);
  if (word.length === 0) return null;
  const bigLength = BigInt(hexlify(word));
  if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  const length = Number(bigLength);
  if (offset + 32 + length > data.length) return null;
  return length;
};

const countLeadingZeros = (arr: Uint8Array) => {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != 0) break;
    count++;
  }
  return count;
};

const countTrailingZeros = (arr: Uint8Array) => {
  let count = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != 0) break;
    count++;
  }
  return count;
};

const formatParams = (params: ParamType[]): string => {
  if (!params || !Array.isArray(params)) return "";
  return `${params.map((v) => v.format()).join(",")}`;
};

const mergeTypes = (types: Array<ParamType>): ParamType => {
  if (types.length === 0) {
    return ParamType.from("()");
  }
  if (types.length === 1) {
    return types[0];
  }
  const baseTypeChecker = new Set<string>(types.map((v) => v.baseType));
  if (baseTypeChecker.size === 1) {
    const baseType = baseTypeChecker.values().next().value;
    if (baseType === "tuple") {
      const componentTypes: Array<ReadonlyArray<ParamType>> = [];
      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        if (!type.isTuple()) throw new Error("unexpected");
        componentTypes.push(type.components!);
      }
      const componentLengthChecker = new Set<number>(
        componentTypes.map((v) => v.length)
      );
      if (componentLengthChecker.size !== 1) {
        return ParamType.from("()");
      }
      const componentLength = componentLengthChecker.values().next().value ?? 0;
      const mergedTypes = [];
      for (let i = 0; i < componentLength; i++) {
        mergedTypes.push(mergeTypes(componentTypes.map((v) => v[i])));
      }
      return ParamType.from(`(${formatParams(mergedTypes)})`);
    }
    if (baseType === "array") {
      const childrenTypes: Array<ParamType> = [];
      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        if (!type.isArray()) throw new Error("unexpected");
        childrenTypes.push(type.arrayChildren!);
      }
      return ParamType.from(`${mergeTypes(childrenTypes).format()}[]`);
    }
  }
  const typeChecker = new Set(types.map((v) => v.type));
  if (typeChecker.size === 1) {
    return types[0];
  }
  if (typeChecker.has("bytes")) {
    return ParamType.from("bytes");
  }
  if (typeChecker.has("uint256")) {
    return ParamType.from("uint256");
  }
  return ParamType.from("bytes32");
};

// -----------------------------------------------------------------------------
// ABI Guessing & Decoding Helpers
// -----------------------------------------------------------------------------

type DecodedParam = ParamType | { offset: number; length: number | null };

const generateConsistentResult = (params: ParamType[]): ParamType | null => {
  if (params.length === 0) return null;
  if (params[0].isTuple() && params[0].components!.length > 0) {
    if (params.find((v) => !v.isTuple()) !== undefined) return null;
    if (new Set(params.map((v) => v.components!.length)).size !== 1)
      return null;
    const components = [];
    for (let i = 0; i < params[0].components!.length; i++) {
      const component = generateConsistentResult(
        params.map((v) => v.components![i])
      );
      if (!component) return null;
      components.push(component);
    }
    return ParamType.from(`(${formatParams(components)})`);
  }
  if (params[0].isArray()) {
    if (params.find((v) => !v.isArray()) !== undefined) return null;
    const arrayChildren = generateConsistentResult(
      params.map((v) => v.arrayChildren!)
    );
    if (!arrayChildren) return null;
    return ParamType.from(`${arrayChildren.format()}[]`);
  }
  const consistencyChecker = new Set<string>();
  for (const param of params) {
    let v = param.format();
    if (v === "()[]") v = "bytes";
    consistencyChecker.add(v);
  }
  if (consistencyChecker.size !== 1) return null;
  return ParamType.from(consistencyChecker.values().next().value);
};

const decodeWellFormedTuple = (
  depth: number,
  data: Uint8Array,
  paramIdx: number,
  collectedParams: Array<DecodedParam>,
  endOfStaticCalldata: number,
  expectedLength: number | null,
  isDynamicArrayElement: boolean | null
): ParamType[] | null => {
  const testParams = (params: ParamType[] | null): params is ParamType[] => {
    if (!params) return false;
    try {
      AbiCoder.defaultAbiCoder().decode(params, data);
      return true;
    } catch (e) {
      return false;
    }
  };

  const paramOffset = paramIdx * 32;
  if (paramOffset < endOfStaticCalldata) {
    const maybeOffset = tryParseOffset(data, paramOffset);
    if (maybeOffset !== null) {
      const maybeLength = tryParseLength(data, maybeOffset);
      if (
        maybeLength !== null &&
        (isDynamicArrayElement === null || isDynamicArrayElement === true)
      ) {
        const fragment = decodeWellFormedTuple(
          depth,
          data,
          paramIdx + 1,
          [...collectedParams, { offset: maybeOffset, length: maybeLength }],
          Math.min(endOfStaticCalldata, maybeOffset),
          expectedLength,
          isDynamicArrayElement
        );
        if (testParams(fragment)) {
          return fragment;
        }
      }
      if (isDynamicArrayElement === null || isDynamicArrayElement === false) {
        const fragment = decodeWellFormedTuple(
          depth,
          data,
          paramIdx + 1,
          [...collectedParams, { offset: maybeOffset, length: null }],
          Math.min(endOfStaticCalldata, maybeOffset),
          expectedLength,
          isDynamicArrayElement
        );
        if (testParams(fragment)) {
          return fragment;
        }
      }
    }
    if (isDynamicArrayElement !== null) {
      return null;
    }
    const fragment = decodeWellFormedTuple(
      depth,
      data,
      paramIdx + 1,
      [...collectedParams, ParamType.from("bytes32")],
      endOfStaticCalldata,
      expectedLength,
      isDynamicArrayElement
    );
    if (testParams(fragment)) {
      return fragment;
    }
    return null;
  }

  if (expectedLength !== null && collectedParams.length !== expectedLength) {
    return null;
  }

  const maybeResolveDynamicParam = (idx: number): ParamType | undefined => {
    const param = collectedParams[idx];
    if (ParamType.isParamType(param)) {
      return param;
    }
    const paramAsPlaceholder = param as {
      offset: number;
      length: number | null;
    };
    const nextDynamicParam = collectedParams
      .slice(idx + 1)
      .find(
        (v): v is { offset: number; length: number | null } =>
          !ParamType.isParamType(v)
      );
    const isTrailingDynamicParam = nextDynamicParam === undefined;
    const maybeDynamicElementLen = paramAsPlaceholder.length;
    const dynamicDataStart =
      paramAsPlaceholder.offset + (maybeDynamicElementLen !== null ? 32 : 0);
    const dynamicDataEnd = isTrailingDynamicParam
      ? data.length
      : (nextDynamicParam as { offset: number }).offset;
    const dynamicData = data.slice(dynamicDataStart, dynamicDataEnd);

    if (maybeDynamicElementLen === null) {
      const params = decodeWellFormedTuple(
        depth + 1,
        dynamicData,
        0,
        [],
        dynamicData.length,
        null,
        null
      );
      if (params === null) {
        return undefined;
      }
      return ParamType.from(`(${formatParams(params)})`);
    }

    if (maybeDynamicElementLen === 0) {
      return ParamType.from("()[]");
    }

    if (
      maybeDynamicElementLen === dynamicData.length ||
      (dynamicData.length % 32 === 0 &&
        dynamicData.length - maybeDynamicElementLen < 32 &&
        dynamicData.slice(maybeDynamicElementLen).filter((v) => v !== 0)
          .length === 0)
    ) {
      return ParamType.from("bytes");
    }

    const allResults: ParamType[][] = [];
    const decodedAssumingLength = decodeWellFormedTuple(
      depth + 1,
      dynamicData,
      0,
      [],
      dynamicData.length,
      maybeDynamicElementLen,
      true
    );
    if (decodedAssumingLength) {
      allResults.push(decodedAssumingLength);
    }
    const decodedAssumingNoLength = decodeWellFormedTuple(
      depth + 1,
      dynamicData,
      0,
      [],
      dynamicData.length,
      maybeDynamicElementLen,
      false
    );
    if (decodedAssumingNoLength) {
      allResults.push(decodedAssumingNoLength);
    }
    const numWords = dynamicData.length / 32;
    const wordsPerElement = Math.floor(numWords / maybeDynamicElementLen);
    const staticParseParams: ParamType[] = [];
    for (let elemIdx = 0; elemIdx < maybeDynamicElementLen; elemIdx++) {
      const params = decodeWellFormedTuple(
        depth + 1,
        dynamicData.slice(
          elemIdx * wordsPerElement * 32,
          (elemIdx + 1) * wordsPerElement * 32
        ),
        0,
        [],
        wordsPerElement * 32,
        null,
        null
      );
      if (params === null || params.length === 0) {
        return undefined;
      }
      if (params.length > 1) {
        staticParseParams.push(ParamType.from(`(${formatParams(params)})`));
      } else {
        staticParseParams.push(params[0]);
      }
    }
    allResults.push(staticParseParams);
    const validResults = allResults
      .map((results) => generateConsistentResult(results))
      .filter((v): v is ParamType => v !== null && v.format() !== "()[]")
      .sort((a, b) => a.format().length - b.format().length);
    if (validResults.length === 0) {
      return undefined;
    }
    return ParamType.from(`${validResults[0].format()}[]`);
  };

  const finalParams: ParamType[] = [];
  for (let i = 0; i < collectedParams.length; i++) {
    const decoded = maybeResolveDynamicParam(i);
    if (!decoded) {
      return null;
    }
    finalParams.push(decoded);
  }
  const valid = testParams(finalParams);
  return valid ? finalParams : null;
};

const inferTypes = (
  params: ReadonlyArray<ParamType>,
  vals: Array<any>
): Array<ParamType> => {
  return params.map((param, idx) => {
    const val = vals[idx];
    if (param.isTuple()) {
      return ParamType.from(
        `(${formatParams(inferTypes(param.components!, val))})`
      );
    }
    if (param.isArray()) {
      const repeatChildTypes = Array(val.length).fill(param.arrayChildren);
      return ParamType.from(
        `${mergeTypes(inferTypes(repeatChildTypes, val)).format()}[]`
      );
    }
    if (param.type === "bytes32") {
      const valBytes =
        typeof val === "string" ? decodeHex(val) : new Uint8Array(0);
      const leadingZeros = countLeadingZeros(valBytes);
      const trailingZeros = countTrailingZeros(valBytes);
      if (leadingZeros >= 12 && leadingZeros <= 17) {
        return ParamType.from("address");
      }
      if (leadingZeros > 16) {
        return ParamType.from("uint256");
      }
      if (trailingZeros > 0) {
        return ParamType.from(`bytes${32 - trailingZeros}`);
      }
      return ParamType.from("bytes32");
    }
    if (param.type === "bytes") {
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(
          typeof val === "string" ? decodeHex(val) : new Uint8Array(0)
        );
        return ParamType.from("string");
      } catch {
        // Not valid UTF-8
      }
      return ParamType.from("bytes");
    }
    return param;
  });
};

export const guessAbiEncodedData = (bytes: BytesLike): ParamType[] | null => {
  try {
    const data = decodeHex(bytes);
    if (data.length === 0) return null;

    const params = decodeWellFormedTuple(
      0,
      data,
      0,
      [],
      data.length,
      null,
      null
    );
    if (!params) return null;

    try {
      const decoded = AbiCoder.defaultAbiCoder().decode(params, data);
      return inferTypes(params, decoded);
    } catch (e) {
      return params;
    }
  } catch (error) {
    return null;
  }
};

export const guessFragment = (calldata: BytesLike): FunctionFragment | null => {
  const bytes = decodeHex(calldata);
  if (bytes.length < 4) return null;
  const params = guessAbiEncodedData(bytes.slice(4));
  if (!params) return null;
  return FunctionFragment.from(`unknown(${formatParams(params)})`);
};

// -----------------------------------------------------------------------------
// Lookup and Decoding Functions (with debug logs)
// -----------------------------------------------------------------------------

async function lookupFunction(selector: string): Promise<string | null> {
  const url = `${SIGNATURE_DB_URL}lookup?function=${selector}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const payload = await response.json();
    if (payload.result?.function?.[selector]) {
      return payload.result.function[selector][0].name;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function getProxyImplementation(
  contractAddress: string
): Promise<string | null> {
  try {
    const client = getPublicClient();
    const normalizedAddress = getAddress(contractAddress);
    const EIP1967_IMPLEMENTATION_SLOT =
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    const implementationSlot = await client.getStorageAt({
      address: normalizedAddress,
      slot: EIP1967_IMPLEMENTATION_SLOT,
    });
    if (implementationSlot && implementationSlot !== "0x" + "0".repeat(64)) {
      return getAddress("0x" + implementationSlot.slice(26));
    }
    const ADMIN_SLOT =
      "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
    const adminSlot = await client.getStorageAt({
      address: normalizedAddress,
      slot: ADMIN_SLOT,
    });
    if (adminSlot && adminSlot !== "0x" + "0".repeat(64)) {
      const IMPLEMENTATION_SLOT =
        "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";
      const implSlot = await client.getStorageAt({
        address: normalizedAddress,
        slot: IMPLEMENTATION_SLOT,
      });
      if (implSlot && implSlot !== "0x" + "0".repeat(64)) {
        return getAddress("0x" + implSlot.slice(26));
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function findFunctionBySelector(abi: any[], selector: string): string | null {
  for (const item of abi) {
    if (item.type !== "function" || !item.name || !item.inputs) continue;
    const inputTypes = item.inputs.map(getCanonicalType).join(",");
    const signature = `${item.name}(${inputTypes})`;
    const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
    const calculatedSelector = hash.slice(0, 10);
    if (calculatedSelector.toLowerCase() === selector.toLowerCase()) {
      return signature;
    }
  }
  return null;
}

function formatTupleForDisplay(components?: DecodedParameter[]): any {
  if (!components) return {};
  const result: {
    [key: string]: {
      type: string;
      components?: any;
      value?: any;
      nestedFunction?: {
        name: string;
        parameters: any;
      };
    };
  } = {};
  components.forEach((component) => {
    if (component.nestedFunction) {
      result[component.name] = {
        type: component.type,
        value: component.value,
        nestedFunction: component.nestedFunction,
      };
    } else if (component.type === "tuple" && component.components) {
      result[component.name] = {
        type: component.type,
        components: formatTupleForDisplay(component.components),
      };
    } else {
      result[component.name] = {
        type: component.type,
        value: component.value,
      };
    }
  });
  return result;
}

function decodeArgsWithSignature(signature: string, calldata: Uint8Array) {
  try {
    const functionFragment = ethers.FunctionFragment.from(signature);
    const decoder = new ethers.AbiCoder();
    const decoded = decoder.decode(functionFragment.inputs, calldata);
    return {
      functionFragment,
      values:
        functionFragment.inputs?.map((type, index) => ({
          type,
          value: decoded[index],
        })) || [],
    };
  } catch (error) {
    return null;
  }
}

function formatSignatureDecodedValue(value: any, paramType: any): any {
  if (!value || typeof value !== "object") {
    return {};
  }
  const result: Record<string, any> = {};
  if (Array.isArray(value)) {
    paramType.components.forEach((component: any, idx: number) => {
      const componentName = component.name || `component${idx}`;
      const componentType = component.type;
      if (componentType.startsWith("tuple")) {
        result[componentName] = {
          type: componentType,
          components: formatSignatureDecodedValue(value[idx], component),
        };
      } else {
        result[componentName] = {
          type: componentType,
          value:
            typeof value[idx] === "bigint" ? value[idx].toString() : value[idx],
        };
      }
    });
  } else {
    Object.keys(value).forEach((key) => {
      if (isNaN(Number(key))) {
        const matchingComponent = paramType.components.find(
          (c: any) => c.name === key
        );
        if (matchingComponent) {
          if (matchingComponent.type.startsWith("tuple")) {
            result[key] = {
              type: matchingComponent.type,
              components: formatSignatureDecodedValue(
                value[key],
                matchingComponent
              ),
            };
          } else {
            result[key] = {
              type: matchingComponent.type,
              value:
                typeof value[key] === "bigint"
                  ? value[key].toString()
                  : value[key],
            };
          }
        }
      }
    });
  }
  return result;
}

async function tryDecodeNestedCall(bytesValue: string): Promise<any | null> {
  if (!bytesValue || bytesValue.length < 10) {
    return null;
  }
  try {
    const selector = bytesValue.slice(0, 10);
    let signature = await cachedLookupFunction(selector);
    if (!signature) {
      const guessedFragment = guessFragment("0x" + bytesValue);
      if (guessedFragment) {
        signature = guessedFragment.format();
      }
    }
    if (!signature) {
      return null;
    }
    const functionName = signature.split("(")[0];
    const rawData = "0x" + bytesValue.slice(10);
    const functionFragment = ethers.FunctionFragment.from(signature);
    const decoder = new ethers.AbiCoder();
    const decoded = decoder.decode(
      functionFragment.inputs,
      ethers.getBytes(rawData)
    );
    const parameters: Record<string, { type: string; value: any }> = {};
    for (let i = 0; i < decoded.length; i++) {
      const param = decoded[i];
      const type = functionFragment.inputs[i];
      const paramName = type.name || `${type.type} ${i}`;
      const paramValue = typeof param === "bigint" ? param.toString() : param;
      parameters[paramName] = {
        type: type.type,
        value: paramValue,
      };
    }
    return {
      name: functionName,
      parameters,
    };
  } catch (error) {
    return null;
  }
}

async function decodeCalldata(
  contractAddress: string,
  functionName: string | null,
  calldata: string,
  etherscanApiKey: string,
  network: string = "mainnet"
): Promise<any> {
  calldata = calldata.startsWith("0x") ? calldata : "0x" + calldata;

  if (!functionName) {
    const selector = calldata.slice(0, 10);
    functionName = await cachedLookupFunction(selector);
    if (!functionName) {
      throw new Error(`Could not identify function for selector ${selector}`);
    }
  }

  const contractAbi = await cachedGetContractAbi(
    contractAddress,
    etherscanApiKey,
    network
  );
  if (!contractAbi) {
    throw new Error(`Could not fetch ABI for contract ${contractAddress}`);
  }
  const functionAbi = contractAbi.find(
    (item) => item.type === "function" && item.name === functionName
  );
  if (!functionAbi || !functionAbi.inputs) {
    throw new Error(
      `Function ${functionName} not found in ABI or has no inputs`
    );
  }

  const inputTypes = functionAbi.inputs.map(getCanonicalType).join(",");
  const canonicalSignature = `${functionAbi.name}(${inputTypes})`;

  // Build a full fragment string that ethers will accept.
  // If there is one parameter (the tuple), add a parameter name.
  let fullSignature: string;
  const isArtificialDetailsParam =
    functionAbi.inputs.length === 1 &&
    functionAbi.inputs[0].type.startsWith("tuple");

  if (isArtificialDetailsParam) {
    // Extract the parameter type (including its outer parentheses)
    const paramType = canonicalSignature.slice(canonicalSignature.indexOf("("));
    // Prepend "function" and add a parameter name
    fullSignature = `function ${functionAbi.name}${paramType.slice(0, paramType.length - 1)} details)`;
  } else {
    // If more than one parameter, simply prepend "function"
    fullSignature = `function ${canonicalSignature}`;
  }

  try {
    const iface = new ethers.Interface([fullSignature]);
    const decoded = iface.decodeFunctionData(fullSignature, calldata);

    const formattedParams: DecodedParameter[] = [];

    for (let i = 0; i < functionAbi.inputs.length; i++) {
      const input = functionAbi.inputs[i];
      const paramName = input.name || `${input.type} ${i}`;

      const decodedValue = isArtificialDetailsParam
        ? decoded["details"] // Use the artificial name to access the value
        : decoded[i]; // Otherwise use the index

      const param = formatParameter(
        paramName,
        input.type,
        decodedValue,
        input.components
      );
      formattedParams.push(param);
    }

    let result = {
      functionName,
      parameters: formattedParams,
    };

    // If we have a single tuple parameter with artificial "details" name,
    // restructure the output to remove the "details" wrapper
    if (isArtificialDetailsParam && formattedParams.length === 1) {
      result = {
        functionName,
        parameters: formattedParams[0].components || [],
      };
    }

    return result;
  } catch (error) {
    throw error;
  }
}

async function tryDecodeWithBothContracts(
  originalTarget: string,
  implementationAddress: string | null,
  functionName: string,
  calldata: string,
  etherscanApiKey: string,
  network: string
) {
  try {
    const decodedOriginal = await cachedDecodeCalldata(
      originalTarget,
      functionName,
      calldata,
      etherscanApiKey,
      network
    );
    return {
      result: decodedOriginal,
      usedAddress: originalTarget,
    };
  } catch (error) {
    if (implementationAddress) {
      try {
        const decodedImpl = await cachedDecodeCalldata(
          implementationAddress,
          functionName,
          calldata,
          etherscanApiKey,
          network
        );
        return {
          result: decodedImpl,
          usedAddress: implementationAddress,
        };
      } catch (implError) {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

async function decodeEnhanced(
  target: string,
  calldata: string,
  etherscanApiKey = DEFAULT_ETHERSCAN_API_KEY,
  network: string = "mainnet"
): Promise<{
  function: string;
  parameters: Record<
    string,
    {
      type: string;
      components?: any;
      value?: any;
      nestedFunction?: {
        name: string;
        parameters: any;
      };
    }
  >;
  usedMethod: string;
  error?: string;
}> {
  if (!etherscanApiKey) throw new Error("Missing API key");
  calldata = calldata.startsWith("0x") ? calldata : "0x" + calldata;
  const functionSelector = calldata.slice(0, 10);
  const formattedOutput = {
    function: functionSelector,
    parameters: {} as Record<
      string,
      {
        type: string;
        components?: any;
        value?: any;
        nestedFunction?: {
          name: string;
          parameters: any;
        };
      }
    >,
    usedMethod: "unknown",
  };

  try {
    const implementationAddress = await cachedGetProxyImplementation(target);
    let functionSignature = await cachedLookupFunction(functionSelector);
    let functionName = functionSignature
      ? functionSignature.split("(")[0]
      : null;
    if (!functionSignature) {
      try {
        const contractAbi = await cachedGetContractAbi(
          target,
          etherscanApiKey,
          network
        );
        if (contractAbi) {
          const matchingFunction = findFunctionBySelector(
            contractAbi,
            functionSelector
          );
          if (matchingFunction) {
            functionSignature = matchingFunction;
            functionName = functionSignature.split("(")[0];
          }
        }
        if (!functionSignature && implementationAddress) {
          const implAbi = await cachedGetContractAbi(
            implementationAddress,
            etherscanApiKey,
            network
          );
          if (implAbi) {
            const matchingFunction = findFunctionBySelector(
              implAbi,
              functionSelector
            );
            if (matchingFunction) {
              functionSignature = matchingFunction;
              functionName = functionSignature.split("(")[0];
            }
          }
        }
        if (!functionSignature) {
          try {
            const response = await fetch(
              `https://www.4byte.directory/api/v1/signatures/?hex_signature=${functionSelector}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              functionSignature = data.results[0].text_signature;
              functionName = functionSignature?.split("(")[0] ?? null;
            }
          } catch (fourByteError) {
            console.error("Error querying 4byte.directory:", fourByteError);
          }
        }
      } catch (abiError) {
        console.error("Error in fallback signature resolution:", abiError);
      }
    }
    if (functionName) {
      try {
        const { result: decoded } = await cachedDecodeWithBothContracts(
          target,
          implementationAddress,
          functionName,
          calldata,
          etherscanApiKey,
          network
        );
        formattedOutput.function = functionName;
        formattedOutput.usedMethod = "signature";
        decoded.parameters.forEach((param: DecodedParameter) => {
          if (param.nestedFunction) {
            formattedOutput.parameters[param.name] = {
              type: param.type,
              value: param.value,
              nestedFunction: param.nestedFunction,
            };
          } else if (param.type === "tuple") {
            formattedOutput.parameters[param.name] = {
              type: param.type,
              components: formatTupleForDisplay(param.components),
            };
          } else {
            formattedOutput.parameters[param.name] = {
              type: param.type,
              value: param.value,
            };
          }
        });
        return formattedOutput;
      } catch (err) {
        console.warn(
          "ABI-based decoding failed, trying fallback methods.",
          err
        );
      }
    }
    try {
      if (functionSignature) {
        try {
          const decoded = decodeArgsWithSignature(
            functionSignature,
            ethers.getBytes(calldata).slice(4)
          );
          if (decoded) {
            formattedOutput.function = decoded.functionFragment.name;
            formattedOutput.usedMethod = "signature_fallback";
            for (let index = 0; index < decoded.values.length; index++) {
              const value = decoded.values[index];
              const paramName =
                decoded.functionFragment.inputs[index].name ||
                `${decoded.functionFragment.inputs[index].type} ${index}`;
              const paramType = decoded.functionFragment.inputs[index].type;
              if (paramType.startsWith("tuple")) {
                formattedOutput.parameters[paramName] = {
                  type: paramType,
                  components: formatSignatureDecodedValue(
                    value.value,
                    decoded.functionFragment.inputs[index]
                  ),
                };
              } else if (paramType === "bytes" && value.value) {
                formattedOutput.parameters[paramName] = {
                  type: paramType,
                  value: value.value,
                };
                const bytesValue = value.value;
                if (bytesValue && bytesValue.length >= 10) {
                  const nestedFunction =
                    await cachedDecodeNestedCall(bytesValue);
                  if (nestedFunction) {
                    formattedOutput.parameters[paramName].nestedFunction =
                      nestedFunction;
                  }
                }
              } else {
                formattedOutput.parameters[paramName] = {
                  type: paramType,
                  value:
                    typeof value.value === "bigint"
                      ? value.value.toString()
                      : value.value,
                };
              }
            }
            return formattedOutput;
          }
        } catch (signatureError) {
          console.warn("Error in signature-based decoding:", signatureError);
        }
      }

      try {
        const guessedFragment = guessFragment(calldata);
        if (guessedFragment) {
          formattedOutput.function = guessedFragment.name;
          formattedOutput.usedMethod = "guessed";
          try {
            const abiCoder = new ethers.AbiCoder();
            const decodedParams = abiCoder.decode(
              guessedFragment.inputs,
              ethers.getBytes(calldata).slice(4)
            );
            for (let i = 0; i < guessedFragment.inputs.length; i++) {
              const input = guessedFragment.inputs[i];
              const paramName = `${input.type} ${i}`;
              const paramValue = decodedParams[i];
              if (input.type.startsWith("tuple")) {
                formattedOutput.parameters[paramName] = {
                  type: input.type,
                  components: {},
                };
              } else if (input.type === "bytes" && paramValue) {
                formattedOutput.parameters[paramName] = {
                  type: input.type,
                  value: paramValue,
                };
                if (typeof paramValue === "string" && paramValue.length >= 10) {
                  const nestedFunction =
                    await cachedDecodeNestedCall(paramValue);
                  if (nestedFunction) {
                    formattedOutput.parameters[paramName].nestedFunction =
                      nestedFunction;
                  }
                }
              } else {
                formattedOutput.parameters[paramName] = {
                  type: input.type,
                  value:
                    typeof paramValue === "bigint"
                      ? paramValue.toString()
                      : paramValue,
                };
              }
            }
            return formattedOutput;
          } catch (decodeError) {
            console.warn("Error decoding guessed fragment:", decodeError);
          }
        }
      } catch (guessError) {
        console.warn("Error guessing fragment:", guessError);
      }
    } catch (fallbackError) {
      console.error("Error in fallback/guessing methods:", fallbackError);
    }
    formattedOutput.usedMethod = "failed";
    return formattedOutput;
  } catch (error) {
    console.error("Error in enhanced decoder:", error);
    return {
      function: functionSelector,
      parameters: {},
      usedMethod: "failed",
      error: (error as Error).message,
    };
  }
}

function formatParameter(
  name: string,
  type: string,
  value: any,
  components?: any[]
): DecodedParameter {
  if (
    type === "bytes" &&
    value &&
    typeof value === "string" &&
    value.length >= 10
  ) {
    return { name, type, value };
  }
  if (typeof value === "bigint") {
    return { name, type, value: value.toString() };
  }
  // Handle non-array tuple
  if (type === "tuple" && components) {
    const tupleComponents: DecodedParameter[] = [];
    components.forEach((component, idx) => {
      const tupleValue = Array.isArray(value)
        ? value[idx]
        : value[component.name || idx];
      tupleComponents.push(
        formatParameter(
          component.name || `component${idx}`,
          component.type,
          tupleValue,
          component.components
        )
      );
    });
    return { name, type, value: null, components: tupleComponents };
  }
  // Handle tuple arrays (e.g. "tuple[]")
  if (type.endsWith("[]") && type.startsWith("tuple") && components) {
    let arr: any[];
    if (Array.isArray(value)) {
      arr = value;
    } else {
      arr = Object.keys(value)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => value[key]);
    }
    const arrayComponents: DecodedParameter[] = [];
    for (let i = 0; i < arr.length; i++) {
      const tupleValue = arr[i];
      const tupleComponents: DecodedParameter[] = [];
      for (let idx = 0; idx < components.length; idx++) {
        const component = components[idx];
        let compValue;
        if (Array.isArray(tupleValue)) {
          compValue = tupleValue[idx];
        } else {
          compValue = tupleValue[component.name || idx];
        }
        tupleComponents.push(
          formatParameter(
            component.name || `component${idx}`,
            component.type,
            compValue,
            component.components
          )
        );
      }
      arrayComponents.push({
        name: `${name}[${i}]`,
        type: "tuple",
        value: tupleComponents,
        components: tupleComponents,
      });
    }
    return { name, type, value: arrayComponents, components: arrayComponents };
  }
  // Handle other non-tuple arrays
  if (type.includes("[") && !type.startsWith("tuple")) {
    if (Array.isArray(value)) {
      const convertedArray = value.map((item) =>
        typeof item === "bigint" ? item.toString() : item
      );
      return { name, type, value: convertedArray };
    }
  }
  return { name, type, value };
}

const cachedLookupFunction = unstable_cache(
  lookupFunction,
  ["function-lookup"],
  { revalidate: 86400 } // Cache for 24 hours
);

const cachedGetProxyImplementation = unstable_cache(
  getProxyImplementation,
  ["proxy-implementation"],
  { revalidate: 86400 }
);

const cachedDecodeEnhanced = unstable_cache(
  decodeEnhanced,
  ["decode-enhanced"],
  { revalidate: 86400 }
);

const cachedDecodeWithBothContracts = unstable_cache(
  tryDecodeWithBothContracts,
  ["decode-with-both-contracts"],
  { revalidate: 86400 }
);

const cachedDecodeCalldata = unstable_cache(
  decodeCalldata,
  ["decode-calldata"],
  { revalidate: 86400 }
);

const cachedDecodeNestedCall = unstable_cache(
  tryDecodeNestedCall,
  ["decode-nested-call"],
  { revalidate: 86400 }
);

export { cachedDecodeEnhanced };
