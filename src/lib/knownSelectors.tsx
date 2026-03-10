import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import {
  getFriendlyName,
  getSchemaName,
  hasFriendlyName,
  hasSchemaName,
} from "./knownAddresses";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface SelectorAdapter {
  name: string;
  prettyName: string;
  prettyRender: (decodedData: DecodedData, target?: string) => React.ReactNode;
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

/** Format raw 18-decimal token amount for display using shared utils. */
function formatTokenAmount(amount: string | number | bigint): string {
  const raw =
    amount == null
      ? 0n
      : typeof amount === "number"
        ? BigInt(Math.floor(amount))
        : BigInt(amount);
  return formatNumber(raw, 18);
}

// ────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ────────────────────────────────────────────────────────────────────────────

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

/**
 * Render an address as a bold friendly name (with tooltip) or a raw monospace address.
 */
function maybeFriendlyAddress(address?: string) {
  if (!address) {
    return <span className="text-secondary">Unknown</span>;
  }

  if (hasFriendlyName(address)) {
    return (
      <LabelWithTooltip label={getFriendlyName(address)!} tooltip={address} />
    );
  }

  return <span className="font-mono text-xs">{address}</span>;
}

// ────────────────────────────────────────────────────────────────────────────
// Parameter extraction helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Recursively collect all scalar values of the given type from decoded params.
 * Walks into nested components (e.g. struct fields inside an EAS AttestationRequest).
 */
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
 * Collect values from array-typed parameters (e.g. "address[]", "bytes[]").
 */
function collectArrayByType(
  parameters: Record<string, DecodedDataParam>,
  type: string
): string[] {
  for (const param of Object.values(parameters)) {
    if (param.type === type && Array.isArray(param.value)) {
      return (param.value as unknown[]).map(String);
    }
    if (param.type === type && param.value !== undefined) {
      return [String(param.value)];
    }
  }
  return [];
}

/**
 * Recursively search for a 66-char hex string (bytes32) inside a `bytes` param.
 * Used to find the content hash embedded in EAS attestation data.
 */
function findContentHash(
  value: DecodedDataParam | Record<string, DecodedDataParam> | undefined
): string | null {
  if (!value) return null;

  const walk = (param: DecodedDataParam): string | null => {
    if (param.type === "bytes" && param.value) {
      const bytesVal = String(param.value);
      if (bytesVal.startsWith("0x") && bytesVal.length === 66) {
        return bytesVal;
      }
    }
    if (param.components) {
      for (const v of Object.values(param.components)) {
        const found = walk(v);
        if (found) return found;
      }
    }
    return null;
  };

  if ("type" in value) {
    return walk(value as DecodedDataParam);
  }
  for (const v of Object.values(value)) {
    const found = findContentHash(v);
    if (found) return found;
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Calldata parsing helpers (for cross-chain bridge decoding)
// ────────────────────────────────────────────────────────────────────────────

function extractSelector(calldata: string): string | null {
  if (!calldata || calldata === "0x") return null;
  const normalized = calldata.toLowerCase();
  const start = normalized.startsWith("0x") ? 2 : 0;
  if (normalized.length < start + 8) return null;
  return `0x${normalized.slice(start, start + 8)}`;
}

/** Extract a 20-byte address from a right-padded 32-byte ABI word. */
function addressFromWord(word: string): string {
  return `0x${word.slice(24, 64)}`;
}

/**
 * Selectors for simple inner calls (selector + single address param) found
 * inside bridge message payloads. Maps 4-byte selector → human-readable name.
 */
const INNER_FUNCTION_NAMES: Record<
  string,
  { name: string; prettyName: string }
> = {
  "0x13af4035": { name: "setOwner", prettyName: "Set Owner" },
  "0xf46901ed": { name: "setFeeTo", prettyName: "Set Fee To" },
  "0xa2e74af6": { name: "setFeeToSetter", prettyName: "Set Fee To Setter" },
  "0xf2fde38b": {
    name: "transferOwnership",
    prettyName: "Transfer Ownership",
  },
};

/**
 * Parse an inner calldata payload (selector + single address argument).
 * Returns null if the selector is not recognized.
 */
function parseInnerCall(innerHex: string): {
  selector: string;
  functionName: string;
  prettyName: string;
  address: string;
} | null {
  const normalized = innerHex.toLowerCase().replace(/^0x/, "");
  if (normalized.length < 72) return null;
  const selector = `0x${normalized.slice(0, 8)}`;
  const info = INNER_FUNCTION_NAMES[selector];
  if (!info) return null;
  return {
    selector,
    functionName: info.name,
    prettyName: info.prettyName,
    address: addressFromWord(normalized.slice(8, 72)),
  };
}

/** Render a decoded inner call (function + address) as a parameter line. */
function InnerCallLine({
  innerCall,
  targetAddress,
}: {
  innerCall: { functionName: string; prettyName: string; address: string };
  targetAddress?: string;
}) {
  return (
    <div className="space-y-1">
      {targetAddress && (
        <div>Target: {maybeFriendlyAddress(targetAddress)}</div>
      )}
      <div>
        {innerCall.prettyName}: {maybeFriendlyAddress(innerCall.address)}
      </div>
    </div>
  );
}

/**
 * Parse a `forward(address,bytes)` call (selector 0x6fadcf72) used by
 * CrossChainAccount contracts to relay calls to L2 targets.
 */
function parseForwardCall(forwardHex: string): {
  target: string;
  innerCalldata: string;
} | null {
  const normalized = forwardHex.toLowerCase().replace(/^0x/, "");
  if (!normalized.startsWith("6fadcf72")) return null;
  if (normalized.length < 200) return null;

  const target = addressFromWord(normalized.slice(8, 72));
  const bytesLen = parseInt(normalized.slice(136, 200), 16);
  if (bytesLen === 0) return null;
  return {
    target,
    innerCalldata: `0x${normalized.slice(200, 200 + bytesLen * 2)}`,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Selector adapters
// ────────────────────────────────────────────────────────────────────────────

export const KNOWN_SELECTORS: Record<string, SelectorAdapter> = {
  // ── EAS ──

  // attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))
  "0xf17325e7": {
    name: "attest",
    prettyName: "Attest",
    prettyRender: (decodedData, target) => {
      const addresses = collectByType(decodedData.parameters, "address");
      const bytes32s = collectByType(decodedData.parameters, "bytes32");

      const recipient = addresses.find((addr) => hasFriendlyName(addr));
      const schemaUid = bytes32s.find((item) => hasSchemaName(item));
      const contentHash = findContentHash(decodedData.parameters);

      const schemaLabel = schemaUid
        ? (getSchemaName(schemaUid) ?? "Unknown Schema")
        : "Unknown Schema";
      const schemaSuffix = schemaLabel.toLowerCase().endsWith("schema")
        ? ""
        : " schema";

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              attest
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract targeting the{" "}
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
                <span className="font-mono text-xs">{contentHash}</span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },

  // ── ERC-20 ──

  // approve(address,uint256)
  "0x095ea7b3": {
    name: "approve",
    prettyName: "Approve",
    prettyRender: (decodedData, target) => {
      const spender = collectByType(decodedData.parameters, "address")[0];
      const amount = collectByType(decodedData.parameters, "uint256")[0];

      return (
        <span className="text-sm text-primary">
          Approve {maybeFriendlyAddress(spender)} to spend{" "}
          {amount ? formatTokenAmount(amount) : "0"}{" "}
          {maybeFriendlyAddress(target)}.
        </span>
      );
    },
  },

  // transfer(address,uint256)
  "0xa9059cbb": {
    name: "transfer",
    prettyName: "Transfer",
    prettyRender: (decodedData, target) => {
      const recipient = collectByType(decodedData.parameters, "address")[0];
      const amount = collectByType(decodedData.parameters, "uint256")[0];
      const isBurn =
        recipient?.toLowerCase() ===
        "0x000000000000000000000000000000000000dead";

      return (
        <span className="text-sm text-primary">
          Send {amount ? formatTokenAmount(amount) : "0"}{" "}
          {maybeFriendlyAddress(target)} {isBurn ? "to the " : "to "}
          {maybeFriendlyAddress(recipient)}.
        </span>
      );
    },
  },

  // ── Funding ──

  // fund(address,uint256)
  "0x7b1837de": {
    name: "fund",
    prettyName: "Fund",
    prettyRender: (decodedData, target) => {
      const recipient = collectByType(decodedData.parameters, "address")[0];
      const amount = collectByType(decodedData.parameters, "uint256")[0];

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              fund
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameters:
          </div>
          <div className="space-y-1 pl-4">
            <div>Recipient: {maybeFriendlyAddress(recipient)}</div>
            <div>Amount: {amount ? formatTokenAmount(amount) : "0"}</div>
          </div>
        </div>
      );
    },
  },

  // ── Factory / Ownership ──

  // setOwner(address)
  "0x13af4035": {
    name: "setOwner",
    prettyName: "Set Owner",
    prettyRender: (decodedData, target) => {
      const owner = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setOwner
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
          </div>
          <div className="pl-4">Owner: {maybeFriendlyAddress(owner)}</div>
        </div>
      );
    },
  },

  // setOwner(bytes32,address)
  "0x5b0fc9c3": {
    name: "setOwner",
    prettyName: "Set Owner (Registry)",
    prettyRender: (decodedData, target) => {
      const owner = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setOwner
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
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
    prettyRender: (decodedData, target) => {
      const feeToSetter = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setFeeToSetter
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
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
    prettyRender: (decodedData, target) => {
      const feeTo = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setFeeTo
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
          </div>
          <div className="pl-4">Fee To: {maybeFriendlyAddress(feeTo)}</div>
        </div>
      );
    },
  },

  // removeAsset(address)
  "0x4a5e42b1": {
    name: "removeAsset",
    prettyName: "Remove Asset",
    prettyRender: (decodedData, target) => {
      const asset = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              removeAsset
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
          </div>
          <div className="pl-4">Asset: {maybeFriendlyAddress(asset)}</div>
        </div>
      );
    },
  },

  // setFactoryOwner(address) — V3FeeAdapter
  "0xf3cc660c": {
    name: "setFactoryOwner",
    prettyName: "Set Factory Owner",
    prettyRender: (decodedData, target) => {
      const newOwner = collectByType(decodedData.parameters, "address")[0];
      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setFactoryOwner
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract with the following
            parameter:
          </div>
          <div className="pl-4">
            New Owner: {maybeFriendlyAddress(newOwner)}
          </div>
        </div>
      );
    },
  },

  // ── Governance / Registry ──

  // adoptSafeHarbor(AgreementDetailsV1) — SEAL Safe Harbor Registry
  "0x121e9ffe": {
    name: "adoptSafeHarbor",
    prettyName: "Adopt Safe Harbor",
    prettyRender: (decodedData, target) => {
      const strings = collectByType(decodedData.parameters, "string");
      const protocolName = strings[0];
      const agreementUri =
        strings.length > 1 && strings[strings.length - 1]?.startsWith("http")
          ? strings[strings.length - 1]
          : undefined;

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              adoptSafeHarbor
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract to register Safe
            Harbor adoption.
          </div>
          {(protocolName || agreementUri) && (
            <div className="space-y-1 pl-4">
              {protocolName && <div>Protocol: {protocolName}</div>}
              {agreementUri && (
                <div>
                  Agreement:{" "}
                  <a
                    href={agreementUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {agreementUri.length > 60
                      ? `${agreementUri.slice(0, 60)}…`
                      : agreementUri}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },

  // ── ENS ──

  // setSubnodeRecord(bytes32,bytes32,address,address,uint64)
  "0x5ef2c7f0": {
    name: "setSubnodeRecord",
    prettyName: "Set ENS Subnode Record",
    prettyRender: (decodedData, target) => {
      const addresses = collectByType(decodedData.parameters, "address");
      const owner = addresses[0];
      const resolver = addresses[1];

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setSubnodeRecord
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract to set a subnode
            record.
          </div>
          <div className="space-y-1 pl-4">
            {owner && <div>Owner: {maybeFriendlyAddress(owner)}</div>}
            {resolver && <div>Resolver: {maybeFriendlyAddress(resolver)}</div>}
          </div>
        </div>
      );
    },
  },

  // setText(bytes32,string,string)
  "0x10f13a8c": {
    name: "setText",
    prettyName: "Set ENS Text Record",
    prettyRender: (decodedData, target) => {
      const key = collectByType(decodedData.parameters, "string")[0];

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              setText
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract to set an ENS text
            record{key ? ":" : "."}
          </div>
          {key && (
            <div className="pl-4">
              <div>Key: {key}</div>
            </div>
          )}
        </div>
      );
    },
  },

  // ── Cross-chain bridges ──

  // depositTransaction(address,uint256,uint64,bool,bytes) — Optimism Portal
  "0xe9e05c42": {
    name: "depositTransaction",
    prettyName: "Deposit Transaction",
    prettyRender: (decodedData, target) => {
      const l2Target = collectByType(decodedData.parameters, "address")[0];
      const innerCalldata = collectByType(decodedData.parameters, "bytes")[0];
      const innerCall = innerCalldata ? parseInnerCall(innerCalldata) : null;

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              depositTransaction
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract targeting{" "}
            {maybeFriendlyAddress(l2Target)}
            {innerCall ? (
              <>
                {" "}
                to call{" "}
                <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
                  {innerCall.functionName}
                </code>{" "}
                with the following parameter:
              </>
            ) : (
              <>.</>
            )}
          </div>
          {innerCall && (
            <div className="pl-4">
              <InnerCallLine innerCall={innerCall} />
            </div>
          )}
        </div>
      );
    },
  },

  // sendMessage(address,bytes,uint32) — L1CrossDomainMessenger (OP Stack)
  "0x3dbb202b": {
    name: "sendMessage",
    prettyName: "Send Cross-Chain Message",
    prettyRender: (decodedData, target) => {
      const crossChainAccount = collectByType(
        decodedData.parameters,
        "address"
      )[0];
      const messageBytes = collectByType(decodedData.parameters, "bytes")[0];

      const forwardResult = messageBytes
        ? parseForwardCall(messageBytes)
        : null;
      const innerCall = forwardResult
        ? parseInnerCall(forwardResult.innerCalldata)
        : null;

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              sendMessage
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract targeting the{" "}
            {maybeFriendlyAddress(crossChainAccount)}
            {innerCall && forwardResult ? (
              <>
                {" "}
                to call{" "}
                <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
                  {innerCall.functionName}
                </code>{" "}
                on {maybeFriendlyAddress(forwardResult.target)} with the
                following parameter:
              </>
            ) : (
              <>.</>
            )}
          </div>
          {innerCall && (
            <div className="pl-4">
              <InnerCallLine innerCall={innerCall} />
            </div>
          )}
        </div>
      );
    },
  },

  // createRetryableTicket(...) — Arbitrum Inbox
  "0x679b6ded": {
    name: "createRetryableTicket",
    prettyName: "Create Retryable Ticket",
    prettyRender: (decodedData, target) => {
      const l2Target = collectByType(decodedData.parameters, "address")[0];
      const innerCalldata = collectByType(decodedData.parameters, "bytes")[0];
      const innerCall = innerCalldata ? parseInnerCall(innerCalldata) : null;

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              createRetryableTicket
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract targeting{" "}
            {maybeFriendlyAddress(l2Target)}
            {innerCall ? (
              <>
                {" "}
                to call{" "}
                <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
                  {innerCall.functionName}
                </code>{" "}
                with the following parameter:
              </>
            ) : (
              <>.</>
            )}
          </div>
          {innerCall && (
            <div className="pl-4">
              <InnerCallLine innerCall={innerCall} />
            </div>
          )}
        </div>
      );
    },
  },

  // sendMessageToChild(address,bytes) — Polygon Fx Root
  "0xb4720477": {
    name: "sendMessageToChild",
    prettyName: "Send Message To Child",
    prettyRender: (decodedData, target) => {
      const childReceiver = collectByType(decodedData.parameters, "address")[0];

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              sendMessageToChild
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract targeting{" "}
            {maybeFriendlyAddress(childReceiver)} with encoded message data.
          </div>
        </div>
      );
    },
  },

  // sendMessage(address[],uint256[],bytes[],address,uint16) — Wormhole
  "0x76ef8453": {
    name: "sendMessage",
    prettyName: "Send Wormhole Message",
    prettyRender: (decodedData, target) => {
      const targetAddresses = collectArrayByType(
        decodedData.parameters,
        "address[]"
      );
      const dataValues = collectArrayByType(decodedData.parameters, "bytes[]");

      const innerCalls: Array<{
        target: string;
        call: NonNullable<ReturnType<typeof parseInnerCall>>;
      }> = [];

      for (let i = 0; i < dataValues.length; i++) {
        const inner = parseInnerCall(dataValues[i]);
        if (inner) {
          innerCalls.push({
            target: i < targetAddresses.length ? targetAddresses[i] : "",
            call: inner,
          });
        }
      }

      return (
        <div className="text-sm text-primary space-y-2">
          <div>
            Call{" "}
            <code className="bg-neutral px-1.5 py-0.5 rounded font-mono text-sm">
              sendMessage
            </code>{" "}
            on the {maybeFriendlyAddress(target)} contract through the{" "}
            <LabelWithTooltip
              label="Wormhole Core Bridge"
              tooltip="0x98f3c9e6e3face36baad05fe09d375ef1464288b"
            />
            {innerCalls.length > 0 ? " with the following actions:" : "."}
          </div>
          {innerCalls.length > 0 && (
            <div className="pl-4 space-y-2">
              {innerCalls.map((item, idx) => (
                <div key={idx}>
                  <InnerCallLine
                    innerCall={item.call}
                    targetAddress={item.target}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export function isSelectorSupported(calldata: string): boolean {
  const selector = extractSelector(calldata);
  if (!selector) return false;
  return selector in KNOWN_SELECTORS;
}

export function areAllActionsSupported(calldatas: string[]): boolean {
  if (calldatas.length === 0) return false;
  return calldatas.every(isSelectorSupported);
}

export function getAdapter(calldata: string): SelectorAdapter | null {
  const selector = extractSelector(calldata);
  if (!selector) return null;
  return KNOWN_SELECTORS[selector] ?? null;
}
