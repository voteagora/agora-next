import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFriendlyName,
  getSchemaName,
  hasFriendlyName,
  hasSchemaName,
} from "./knownAddresses";
import { shortAddress } from "./utils";

export interface SelectorAdapter {
  name: string;
  prettyName: string;
  prettyRender: (decodedData: DecodedData) => React.ReactNode;
}

interface DecodedDataParam {
  type: string;
  value?: string | number | bigint;
  components?: Record<string, DecodedDataParam>;
}

interface DecodedData {
  function: string;
  parameters: Record<string, DecodedDataParam>;
}

function formatTokenAmount(amount: string | number | bigint): string {
  let raw: bigint;
  if (typeof amount === "bigint") raw = amount;
  else if (typeof amount === "number") raw = BigInt(Math.floor(amount));
  else raw = BigInt(amount);
  return (raw / 10n ** 18n).toLocaleString();
}

function LabelWithTooltip({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}) {
  if (!tooltip) {
    return <span className="font-semibold">{label}</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-semibold cursor-pointer">{label}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs break-all max-w-[420px]">{tooltip}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function maybeFriendlyAddress(address?: string) {
  if (!address) {
    return <span className="text-secondary">Unknown</span>;
  }

  if (hasFriendlyName(address)) {
    return (
      <LabelWithTooltip
        label={getFriendlyName(address) ?? shortAddress(address)}
        tooltip={address}
      />
    );
  }

  return <span className="font-mono text-xs">{shortAddress(address)}</span>;
}

function collectByType(
  value: DecodedDataParam | Record<string, DecodedDataParam> | undefined,
  type: string
): string[] {
  if (!value) return [];
  const out: string[] = [];

  const walkParam = (param: DecodedDataParam) => {
    if (param.type === type && param.value !== undefined) {
      out.push(String(param.value));
    }
    if (param.components) {
      Object.values(param.components).forEach(walkParam);
    }
  };

  if ("type" in value) {
    walkParam(value as DecodedDataParam);
  } else {
    Object.values(value).forEach(walkParam);
  }

  return out;
}

/**
 * Extract contentHash from EAS attest parameters.
 * For DUNI Agreement schema (protocol-fees), contentHash is ABI-encoded in the
 * inner `data` bytes of AttestationRequestData: data = abi.encode(contentHash).
 * Structure: AttestationRequest(schema, AttestationRequestData(..., data, ...))
 */
function getAttestContentHash(
  parameters: Record<string, DecodedDataParam>
): string | null {
  const dataParam = parameters.data ?? parameters.details;
  if (!dataParam?.components) return null;

  const innerData = dataParam.components.data;
  if (!innerData || innerData.type !== "bytes" || !innerData.value) return null;

  const bytesVal = String(innerData.value);
  // DUNI schema: abi.encode(bytes32) = 32 bytes = 64 hex chars + 0x
  if (bytesVal.startsWith("0x") && bytesVal.length === 66) {
    return bytesVal;
  }
  return null;
}

function extractSelector(calldata: string): string | null {
  if (!calldata || calldata === "0x") return null;
  const normalized = calldata.toLowerCase();
  const start = normalized.startsWith("0x") ? 2 : 0;
  if (normalized.length < start + 8) return null;
  return `0x${normalized.slice(start, start + 8)}`;
}

export const KNOWN_SELECTORS: Record<string, SelectorAdapter> = {
  // attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))
  "0xf17325e7": {
    name: "attest",
    prettyName: "Attest",
    prettyRender: (decodedData) => {
      const addresses = collectByType(decodedData.parameters, "address");
      const bytes32s = collectByType(decodedData.parameters, "bytes32");

      const recipient = addresses.find((addr) => hasFriendlyName(addr));
      const schemaUid = bytes32s.find((item) => hasSchemaName(item));
      const contentHash = getAttestContentHash(decodedData.parameters);

      const schemaLabel = schemaUid
        ? (getSchemaName(schemaUid) ?? "Unknown Schema")
        : "Unknown Schema";
      // Avoid "Schema schema" - schema name may already include "Schema"
      const schemaSuffix = schemaLabel.toLowerCase().endsWith("schema")
        ? ""
        : " schema";

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call <code className="font-semibold">attest</code> on the{" "}
            <LabelWithTooltip
              label="EAS Attestation Service"
              tooltip="0xa1207f3bba224e2c9c3c6d5af63d0eb1582ce587"
            />{" "}
            contract targeting the{" "}
            <LabelWithTooltip
              label={schemaLabel}
              tooltip={schemaUid ?? undefined}
            />
            {schemaSuffix} with the following parameters:
          </div>

          <div className="space-y-1 pl-4">
            {recipient && (
              <div>Recipient: {maybeFriendlyAddress(recipient)}</div>
            )}
            {contentHash && (
              <div>
                Content Hash:{" "}
                <LabelWithTooltip
                  label={shortAddress(contentHash)}
                  tooltip={contentHash}
                />
              </div>
            )}
          </div>
        </div>
      );
    },
  },

  // approve(address,uint256)
  "0x095ea7b3": {
    name: "approve",
    prettyName: "Approve",
    prettyRender: (decodedData) => {
      const addresses = collectByType(decodedData.parameters, "address");
      const amounts = collectByType(decodedData.parameters, "uint256");
      const spender = addresses[0];
      const amount = amounts[0];

      return (
        <span className="text-sm text-primary">
          Approve {maybeFriendlyAddress(spender)} to spend{" "}
          {amount ? formatTokenAmount(amount) : "0"} tokens from{" "}
          <LabelWithTooltip
            label="UNI Token"
            tooltip="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
          />
          .
        </span>
      );
    },
  },

  // transfer(address,uint256)
  "0xa9059cbb": {
    name: "transfer",
    prettyName: "Transfer",
    prettyRender: (decodedData) => {
      const addresses = collectByType(decodedData.parameters, "address");
      const amounts = collectByType(decodedData.parameters, "uint256");
      const recipient = addresses[0];
      const amount = amounts[0];

      return (
        <span className="text-sm text-primary">
          Send {amount ? formatTokenAmount(amount) : "0"}{" "}
          <LabelWithTooltip
            label="UNI Token"
            tooltip="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
          />{" "}
          to {maybeFriendlyAddress(recipient)}.
        </span>
      );
    },
  },

  // setOwner(address)
  "0x13af4035": {
    name: "setOwner",
    prettyName: "Set Owner",
    prettyRender: (decodedData) => {
      const owner = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call <code className="font-semibold">setOwner</code> on the{" "}
            <LabelWithTooltip
              label="Uniswap V3 Factory"
              tooltip="0x1f98431c8ad98523631ae4a59f267346ea31f984"
            />{" "}
            contract with the following parameter:
          </div>
          <div className="pl-4">Owner: {maybeFriendlyAddress(owner)}</div>
        </div>
      );
    },
  },

  // setFeeToSetter(address)
  "0xa2e74af6": {
    name: "setFeeToSetter",
    prettyName: "Set Fee To Setter",
    prettyRender: (decodedData) => {
      const feeToSetter = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call <code className="font-semibold">setFeeToSetter</code> on the{" "}
            <LabelWithTooltip
              label="Uniswap V2 FeeToSetter"
              tooltip="0x18e433c7bf8a2e1d0197ce5d8f9afada1a771360"
            />{" "}
            contract with the following parameter:
          </div>
          <div className="pl-4">
            Fee To Setter: {maybeFriendlyAddress(feeToSetter)}
          </div>
        </div>
      );
    },
  },

  // setFeeTo(address)
  "0xf46901ed": {
    name: "setFeeTo",
    prettyName: "Set Fee To",
    prettyRender: (decodedData) => {
      const feeTo = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call <code className="font-semibold">setFeeTo</code> on the{" "}
            <LabelWithTooltip
              label="Uniswap V2 Factory"
              tooltip="0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
            />{" "}
            contract with the following parameter:
          </div>
          <div className="pl-4">Fee To: {maybeFriendlyAddress(feeTo)}</div>
        </div>
      );
    },
  },
};

export function isSelectorSupported(calldata: string): boolean {
  const selector = extractSelector(calldata);
  if (!selector) return false;
  return selector in KNOWN_SELECTORS;
}

export function areAllActionsSupported(calldatas: string[]): boolean {
  if (calldatas.length === 0) return false;
  return calldatas.every((calldata) => isSelectorSupported(calldata));
}

export function getAdapter(calldata: string): SelectorAdapter | null {
  const selector = extractSelector(calldata);
  if (!selector) return null;
  return KNOWN_SELECTORS[selector] ?? null;
}
