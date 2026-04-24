import { decodeFunctionData, parseAbi, type Address } from "viem";
import type { DecodedExecutionLog } from "@/hooks/useExecutionTxLogs";
import { getFriendlyName } from "@/lib/knownAddresses";
import { shortAddress } from "@/lib/utils";

const DEPOSIT_TRANSACTION_ABI = parseAbi([
  "function depositTransaction(address,uint256,uint64,bool,bytes)",
]);
const SEND_MESSAGE_ABI = parseAbi([
  "function sendMessage(address,bytes,uint32)",
]);
const FORWARD_ABI = parseAbi(["function forward(address,bytes)"]);

const INNER_CALL_DECODERS = [
  {
    abi: parseAbi(["function setOwner(address)"]),
    prettyName: "Set Owner",
    formatSummary: (address: Address) =>
      `set owner to ${formatExecutionAddressLabel(address)}`,
  },
  {
    abi: parseAbi(["function setFeeTo(address)"]),
    prettyName: "Set Fee To",
    formatSummary: (address: Address) =>
      `set fee recipient to ${formatExecutionAddressLabel(address)}`,
  },
  {
    abi: parseAbi(["function setFeeToSetter(address)"]),
    prettyName: "Set Fee To Setter",
    formatSummary: (address: Address) =>
      `set fee setter to ${formatExecutionAddressLabel(address)}`,
  },
  {
    abi: parseAbi(["function transferOwnership(address)"]),
    prettyName: "Transfer Ownership",
    formatSummary: (address: Address) =>
      `transfer ownership to ${formatExecutionAddressLabel(address)}`,
  },
] as const;

type ArgsRecord = Record<string, unknown>;

export type ExecutionLogField = {
  label: string;
  type: "address" | "boolean" | "bytes" | "hash" | "number" | "text";
  value: string;
  fullValue?: string;
  address?: Address;
};

export type ExecutionLogPresentation = {
  title: string;
  summary: string | null;
  fields: ExecutionLogField[];
};

export type DisplayExecutionLog = DecodedExecutionLog & {
  pairedValue: bigint | null;
};

type ParsedInnerCall = {
  functionName: string;
  prettyName: string;
  recipient: Address;
};

type ParsedForwardCall = {
  target: Address;
  innerCalldata: `0x${string}`;
};

type ParsedOpaqueData = {
  mint: bigint;
  value: bigint;
  gasLimit: bigint;
  isCreation: boolean;
  data: `0x${string}`;
};

export function formatExecutionAddressLabel(address: string): string {
  return getFriendlyName(address) ?? shortAddress(address);
}

export function pairExecutionLogsForDisplay(
  logs: DecodedExecutionLog[]
): DisplayExecutionLog[] {
  const paired: DisplayExecutionLog[] = [];

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i]!;
    const next = logs[i + 1];

    if (
      current.eventName === "SentMessage" &&
      next?.eventName === "SentMessageExtension1" &&
      next.address.toLowerCase() === current.address.toLowerCase()
    ) {
      paired.push({
        ...current,
        pairedValue: getBigIntArg(next.args, "value"),
      });
      i += 1;
      continue;
    }

    paired.push({
      ...current,
      pairedValue: null,
    });
  }

  return paired;
}

export function buildExecutionLogPresentation(
  log: DisplayExecutionLog
): ExecutionLogPresentation {
  if (log.decodeSource === "nameOnly" && log.eventName) {
    return {
      title: log.eventName,
      summary: "Signature catalog name; parameters not decoded.",
      fields: [],
    };
  }
  const args = asArgsRecord(log.args);

  if (log.eventName === "ExecuteTransaction" && args) {
    return buildExecuteTransactionPresentation(args);
  }

  if (log.eventName === "TransactionDeposited" && args) {
    return buildTransactionDepositedPresentation(log.address, args);
  }

  if (log.eventName === "SentMessage" && args) {
    return buildSentMessagePresentation(args, log.pairedValue);
  }

  if (log.eventName === "SentMessageExtension1" && args) {
    return {
      title: "Message Value Extension",
      summary:
        "Additional value metadata emitted alongside the preceding message.",
      fields: [
        addressField("Sender", asAddress(args.sender)),
        numberField("Value", args.value),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "ProposalExecuted" && args) {
    const proposalId = asBigInt(args.id);

    return {
      title: "Proposal Executed",
      summary: `Proposal ${proposalId?.toString() ?? "?"} has been marked as executed.`,
      fields: [numberField("Proposal ID", args.id)].filter(
        Boolean
      ) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Attested" && args) {
    const recipient = asAddress(args.recipient);
    const attester = asAddress(args.attester);
    return {
      title: "EAS attestation",
      summary:
        recipient && attester
          ? `Attested for ${formatExecutionAddressLabel(recipient)} by ${formatExecutionAddressLabel(attester)}.`
          : "New onchain attestation (EAS).",
      fields: [
        addressField("Recipient", recipient),
        addressField("Attester", attester),
        hashField("UID", args.uid),
        hashField("Schema", args.schemaUID),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Revoked" && args) {
    const recipient = asAddress(args.recipient);
    const attester = asAddress(args.attester);
    return {
      title: "EAS revocation",
      summary:
        recipient && attester
          ? `Revoked for ${formatExecutionAddressLabel(recipient)} by ${formatExecutionAddressLabel(attester)}.`
          : "Attestation revoked (EAS).",
      fields: [
        addressField("Recipient", recipient),
        addressField("Attester", attester),
        hashField("UID", args.uid),
        hashField("Schema", args.schemaUID),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Transfer" && args) {
    if (
      log.raw.topics.length === 2 &&
      typeof (args as ArgsRecord).node === "string" &&
      asAddress((args as ArgsRecord).owner)
    ) {
      const ar = args as ArgsRecord;
      return {
        title: "ENS name transfer",
        summary: "ENS name ownership was updated for this node.",
        fields: [
          hashField("Node", ar.node),
          addressField("Owner", asAddress(ar.owner)),
        ].filter(Boolean) as ExecutionLogField[],
      };
    }
    const from = asAddress(args.from);
    const to = asAddress(args.to);
    return {
      title: "Token transfer",
      summary:
        from && to
          ? `${formatExecutionAddressLabel(from)} → ${formatExecutionAddressLabel(to)}.`
          : "ERC-20 transfer.",
      fields: [
        addressField("From", from),
        addressField("To", to),
        numberField("Value", args.value),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Approval" && args) {
    const owner = asAddress(args.owner);
    const spender = asAddress(args.spender);
    return {
      title: "Token approval",
      summary:
        owner && spender
          ? `${formatExecutionAddressLabel(owner)} approved ${formatExecutionAddressLabel(spender)}.`
          : "ERC-20 approval.",
      fields: [
        addressField("Owner", owner),
        addressField("Spender", spender),
        numberField("Value", args.value),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "OwnerChanged" && args) {
    const previous = asAddress(args.previousOwner);
    const next = asAddress(args.newOwner);
    return {
      title: "Owner changed",
      summary:
        previous && next
          ? `${formatExecutionAddressLabel(previous)} → ${formatExecutionAddressLabel(next)}.`
          : "Module or proxy owner updated.",
      fields: [
        addressField("Previous", previous),
        addressField("New", next),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "TextChanged" && args) {
    const val = stringValue(args.value);
    return {
      title: "ENS text record",
      summary: val
        ? `Text record updated: ${val.length > 120 ? `${val.slice(0, 120)}…` : val}`
        : "ENS resolver text record changed.",
      fields: [
        hashField("Node", args.node),
        hashField("Key", args.key),
        val ? textField("Value", val) : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "MessageDelivered" && args) {
    return {
      title: "Arbitrum message delivered",
      summary: "L2-to-L1 message was delivered on the Arbitrum bridge.",
      fields: [
        numberField("Message index", args.messageIndex),
        hashField("Before inbox acc", args.beforeInboxAcc),
        addressField("Bridge", asAddress(args.bridge)),
        numberField("Kind", args.kind),
        addressField("Sender", asAddress(args.sender)),
        hashField("L2 data hash", args.l2DataHash),
        numberField("L1 block", args.l1Block),
        numberField("Timestamp", args.timestamp),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "InboxMessageDelivered" && args) {
    return {
      title: "Arbitrum inbox message",
      summary: "Message was delivered into the Arbitrum delayed inbox.",
      fields: [
        numberField("Message no.", args.messageNum),
        args.data && typeof args.data === "string"
          ? {
              label: "Data",
              type: "bytes" as const,
              value: summarizeHex(args.data),
              fullValue:
                summarizeHex(args.data) === args.data ? undefined : args.data,
            }
          : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "UpkeepPerformed" && args) {
    return {
      title: "Chainlink upkeep",
      summary: "Automation upkeep ran for a registered target.",
      fields: [
        numberField("Upkeep id", args.id),
        booleanField("Success", Boolean(args.success)),
        addressField("Keeper", asAddress(args.keeper)),
        numberField("Payment", args.payment),
        args.data && typeof args.data === "string"
          ? {
              label: "Data",
              type: "bytes" as const,
              value: summarizeHex(args.data),
              fullValue:
                summarizeHex(args.data) === args.data ? undefined : args.data,
            }
          : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "DelegateChanged" && args) {
    const d1 = asAddress(args.delegator);
    const d2 = asAddress(args.toDelegate);
    return {
      title: "Delegation change",
      summary:
        d1 && d2
          ? `${formatExecutionAddressLabel(d1)} now delegates to ${formatExecutionAddressLabel(d2)}.`
          : "Governance token delegation changed.",
      fields: [
        addressField("Delegator", d1),
        addressField("Previous", asAddress(args.fromDelegate)),
        addressField("Current", d2),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "DelegateVotesChanged" && args) {
    const del = asAddress(args.delegate);
    return {
      title: "Delegate vote power",
      summary: del
        ? `Vote balance changed for ${formatExecutionAddressLabel(del)}.`
        : "Governance delegate vote balance changed.",
      fields: [
        addressField("Delegate", del),
        numberField("Previous", args.previousBalance),
        numberField("New", args.newBalance),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Initialized" && args) {
    return {
      title: "Contract initialized",
      summary: "Stream, vesting, or module contract completed its initializer.",
      fields: [
        addressField("A", asAddress(args.a)),
        addressField("B", asAddress(args.b)),
        addressField("C", asAddress(args.c)),
        numberField("Amount", args.amount),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "NewOwner" && args) {
    return {
      title: "ENS subnode owner",
      summary: "ENS registry subnode owner was set.",
      fields: [
        hashField("Node", args.node),
        hashField("Label", args.label),
        addressField("Owner", asAddress(args.owner)),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "NewResolver" && args) {
    return {
      title: "ENS resolver",
      summary: "ENS resolver address was updated for this node.",
      fields: [
        hashField("Node", args.node),
        addressField("Resolver", asAddress(args.resolver)),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "OwnershipTransferred" && args) {
    const prev = asAddress(args.previousOwner);
    const next = asAddress(args.newOwner);
    return {
      title: "Ownership transfer",
      summary:
        prev && next
          ? `${formatExecutionAddressLabel(prev)} → ${formatExecutionAddressLabel(next)}.`
          : "OpenZeppelin Ownable role was transferred.",
      fields: [
        addressField("Previous", prev),
        addressField("New", next),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Unpaused" && args) {
    const acc = asAddress(args.account);
    return {
      title: "Unpaused",
      summary: acc
        ? `Contract unpaused by ${formatExecutionAddressLabel(acc)}.`
        : "Contract was unpaused.",
      fields: [addressField("Account", acc)].filter(
        Boolean
      ) as ExecutionLogField[],
    };
  }

  if (log.eventName === "LogMessagePublished" && args) {
    return {
      title: "CCTP message",
      summary: "Cross-chain message published (CCTP).",
      fields: [
        addressField("Sender", asAddress(args.sender)),
        numberField("Sequence", args.sequence),
        numberField("Source domain", args.sourceDomain),
        args.message && typeof args.message === "string"
          ? {
              label: "Message",
              type: "bytes" as const,
              value: summarizeHex(args.message),
              fullValue:
                summarizeHex(args.message) === args.message
                  ? undefined
                  : args.message,
            }
          : null,
        numberField("Type", args.attestationType),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "MessageSent" && args) {
    const s = asAddress(args.sender);
    return {
      title: "Wormhole message",
      summary: s
        ? `Message sent via relayer / router ${formatExecutionAddressLabel(s)}.`
        : "Wormhole or bridge-style message was emitted.",
      fields: [
        s ? addressField("Sender", s) : null,
        args.message && typeof args.message === "string"
          ? {
              label: "Message",
              type: "bytes" as const,
              value: summarizeHex(args.message),
              fullValue:
                summarizeHex(args.message) === args.message
                  ? undefined
                  : args.message,
            }
          : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "SafeHarborAdoption" && args) {
    return {
      title: "Safe Harbor adoption",
      summary: "Contract opted into a Safe Harbor program.",
      fields: [
        addressField("Target", asAddress(args.safe)),
        addressField("New owner", asAddress(args.newOwner)),
        addressField("New guardian", asAddress(args.newGuardian)),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "MetadataUpdate" && args) {
    return {
      title: "NFT metadata",
      summary: "ERC-4906 or similar onchain metadata update signal.",
      fields: [numberField("Token id", args.id)].filter(
        Boolean
      ) as ExecutionLogField[],
    };
  }

  if (log.eventName === "ProposalThresholdSet" && args) {
    return {
      title: "Proposal threshold",
      summary: "Governor proposal signature threshold was updated.",
      fields: [
        numberField("Previous", args.oldThreshold),
        numberField("New", args.newThreshold),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Deposit" && args) {
    if (log.raw.topics.length === 2) {
      const dst = asAddress((args as ArgsRecord).dst);
      return {
        title: "WETH deposit",
        summary: dst
          ? `ETH wrapped for ${formatExecutionAddressLabel(dst)}.`
          : "ETH was wrapped to WETH.",
        fields: [
          addressField("To", dst),
          numberField("Wad", (args as ArgsRecord).wad),
        ].filter(Boolean) as ExecutionLogField[],
      };
    }
    const from = asAddress(args.from);
    const to = asAddress(args.to);
    return {
      title: "Deposit",
      summary:
        from && to
          ? `${formatExecutionAddressLabel(from)} → ${formatExecutionAddressLabel(to)}.`
          : "Vault or bridge deposit event.",
      fields: [
        addressField("From", from),
        addressField("To", to),
        numberField("Value", args.value),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "FeeAmountEnabled" && args) {
    return {
      title: "Uniswap v3 pool fee",
      summary: "A fee tier was enabled on the Uniswap v3 factory.",
      fields: [
        numberField("Fee", args.fee),
        numberField("Tick spacing", args.tickSpacing),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "TransactionEnqueued" && args) {
    return {
      title: "OP transaction enqueued",
      summary: "An L1→L2 transaction was queued in the OP-stack bridge.",
      fields: [
        addressField("L1 origin", asAddress(args.l1TxOrigin)),
        addressField("L1 target", asAddress(args.l1Target)),
        numberField("Queue index", args.queueIndex),
        args.encodedData && typeof args.encodedData === "string"
          ? {
              label: "Data",
              type: "bytes" as const,
              value: summarizeHex(args.encodedData),
              fullValue:
                summarizeHex(args.encodedData) === args.encodedData
                  ? undefined
                  : args.encodedData,
            }
          : null,
        numberField("T1", args.t1),
        numberField("T2", args.t2),
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "Dispatch" && args) {
    return {
      title: "Hyperlane dispatch",
      summary: "Cross-chain dispatch message was sent.",
      fields: [
        hashField("Message id", args.messageId),
        numberField("Destination domain", args.destinationDomain),
        numberField("Source field", args.sourceU64),
        hashField("Data hash", args.dataHash),
        args.messageBody && typeof args.messageBody === "string"
          ? {
              label: "Message",
              type: "bytes" as const,
              value: summarizeHex(args.messageBody),
              fullValue:
                summarizeHex(args.messageBody) === args.messageBody
                  ? undefined
                  : args.messageBody,
            }
          : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  if (log.eventName === "StateSynced" && args) {
    const c = asAddress(args.contract);
    return {
      title: "Polygon state sync",
      summary: c
        ? `State for ${formatExecutionAddressLabel(
            c
          )} was synced to the child chain.`
        : "Polygon state-sync bridge event was emitted on L1.",
      fields: [
        numberField("Id", args.id),
        c ? addressField("Contract", c) : null,
        args.data && typeof args.data === "string"
          ? {
              label: "Data",
              type: "bytes" as const,
              value: summarizeHex(args.data),
              fullValue:
                summarizeHex(args.data) === args.data ? undefined : args.data,
            }
          : null,
      ].filter(Boolean) as ExecutionLogField[],
    };
  }

  return {
    title: log.eventName ?? "Unknown event",
    summary:
      log.eventName && log.byAbi
        ? `Decoded from onchain log data for ${formatExecutionAddressLabel(log.address)}.`
        : null,
    fields: buildGenericFields(args),
  };
}

function buildExecuteTransactionPresentation(
  args: ArgsRecord
): ExecutionLogPresentation {
  const target = asAddress(args.target);
  const data = stringValue(args.data);
  const eta = asBigInt(args.eta);
  const parsedCall = data ? parseOuterAction(data) : null;

  return {
    title: "Execute transaction",
    summary: parsedCall
      ? parsedCall.summary
      : target
        ? `Call on ${formatExecutionAddressLabel(target)}.`
        : "Contract executed a queued or relayed call.",
    fields: [
      hashField("Tx Hash", args.txHash),
      addressField("Target", target),
      parsedCall ? textField("Call", parsedCall.prettyName) : null,
      parsedCall?.target
        ? addressField("Action Target", parsedCall.target)
        : null,
      parsedCall?.forwardTarget
        ? addressField("Forwarded To", parsedCall.forwardTarget)
        : null,
      parsedCall?.innerCall
        ? textField("Nested Action", parsedCall.innerCall.prettyName)
        : null,
      parsedCall?.innerCall
        ? addressField("Nested Recipient", parsedCall.innerCall.recipient)
        : null,
      parsedCall?.gasLimit != null
        ? numberField("Gas Limit", parsedCall.gasLimit)
        : null,
      eta != null ? textField("ETA", formatUnixTime(eta)) : null,
    ].filter(Boolean) as ExecutionLogField[],
  };
}

function buildTransactionDepositedPresentation(
  emitter: Address,
  args: ArgsRecord
): ExecutionLogPresentation {
  const from = asAddress(args.from);
  const to = asAddress(args.to);
  const version = asBigInt(args.version);
  const opaqueData = stringValue(args.opaqueData);
  const parsedOpaqueData = opaqueData
    ? parseDepositOpaqueData(opaqueData)
    : null;
  const parsedInnerCall =
    parsedOpaqueData?.data != null
      ? parseKnownInnerCall(parsedOpaqueData.data)
      : null;

  return {
    title: "Deposit Transaction",
    summary:
      parsedInnerCall && to
        ? `${formatExecutionAddressLabel(emitter)} deposited a transaction for ${formatExecutionAddressLabel(
            to
          )} to ${formatInnerCallSummary(parsedInnerCall)}.`
        : to
          ? `${formatExecutionAddressLabel(emitter)} deposited a transaction for ${formatExecutionAddressLabel(
              to
            )}.`
          : "A deposit transaction was emitted by an OP-stack portal.",
    fields: [
      addressField("From", from),
      addressField("To", to),
      version != null ? numberField("Version", version) : null,
      parsedOpaqueData ? numberField("Mint", parsedOpaqueData.mint) : null,
      parsedOpaqueData ? numberField("Value", parsedOpaqueData.value) : null,
      parsedOpaqueData
        ? numberField("Gas Limit", parsedOpaqueData.gasLimit)
        : null,
      parsedOpaqueData
        ? booleanField("Creation", parsedOpaqueData.isCreation)
        : null,
      parsedInnerCall
        ? textField("Nested Action", parsedInnerCall.prettyName)
        : null,
      parsedInnerCall
        ? addressField("Nested Recipient", parsedInnerCall.recipient)
        : null,
    ].filter(Boolean) as ExecutionLogField[],
  };
}

function buildSentMessagePresentation(
  args: ArgsRecord,
  pairedValue: bigint | null
): ExecutionLogPresentation {
  const target = asAddress(args.target);
  const sender = asAddress(args.sender);
  const message = stringValue(args.message);
  const nonce = asBigInt(args.messageNonce);
  const gasLimit = asBigInt(args.gasLimit);
  const forward = message ? parseForwardCall(message) : null;
  const innerCall =
    forward?.innerCalldata != null
      ? parseKnownInnerCall(forward.innerCalldata)
      : null;

  return {
    title: "Send Cross-Chain Message",
    summary:
      target && forward && innerCall
        ? `${formatExecutionAddressLabel(target)} will forward a call on ${formatExecutionAddressLabel(
            forward.target
          )} to ${formatInnerCallSummary(innerCall)}.`
        : target
          ? `${formatExecutionAddressLabel(target)} received a cross-chain message.`
          : "A cross-chain message was emitted by an L1 messenger.",
    fields: [
      addressField("Target", target),
      addressField("Sender", sender),
      forward ? addressField("Forwarded To", forward.target) : null,
      innerCall ? textField("Nested Action", innerCall.prettyName) : null,
      innerCall ? addressField("Nested Recipient", innerCall.recipient) : null,
      gasLimit != null ? numberField("Min Gas Limit", gasLimit) : null,
      nonce != null ? numberField("Message Nonce", nonce) : null,
      pairedValue != null ? numberField("Value", pairedValue) : null,
    ].filter(Boolean) as ExecutionLogField[],
  };
}

function buildGenericFields(args: ArgsRecord | null): ExecutionLogField[] {
  if (!args) {
    return [];
  }

  return Object.entries(args)
    .map(([key, value]) => buildGenericField(key, value))
    .filter(Boolean) as ExecutionLogField[];
}

function buildGenericField(
  label: string,
  value: unknown
): ExecutionLogField | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "boolean") {
    return booleanField(label, value);
  }

  if (typeof value === "bigint") {
    return numberField(label, value);
  }

  if (typeof value === "number") {
    return numberField(label, BigInt(value));
  }

  if (typeof value === "string") {
    if (isAddressLike(value)) {
      return addressField(label, value as Address);
    }
    if (value.startsWith("0x")) {
      const summarized = summarizeHex(value);
      return {
        label: humanizeLabel(label),
        type: value.length === 66 ? "hash" : "bytes",
        value: summarized,
        fullValue: summarized === value ? undefined : value,
      };
    }
    return textField(label, value);
  }

  return textField(label, JSON.stringify(value));
}

function parseOuterAction(data: string): {
  functionName: string;
  prettyName: string;
  summary: string;
  target?: Address;
  forwardTarget?: Address;
  gasLimit?: bigint;
  innerCall?: ParsedInnerCall;
} | null {
  try {
    const decoded = decodeFunctionData({
      abi: DEPOSIT_TRANSACTION_ABI,
      data: data as `0x${string}`,
    });
    const target = decoded.args[0] as Address;
    const gasLimit = asBigInt(decoded.args[2]) ?? null;
    const innerCalldata = decoded.args[4] as `0x${string}`;
    const innerCall = parseKnownInnerCall(innerCalldata);

    return {
      functionName: decoded.functionName,
      prettyName: "Deposit Transaction",
      summary: innerCall
        ? `${formatExecutionAddressLabel(target)} can ${formatInnerCallSummary(
            innerCall
          )}`
        : `${formatExecutionAddressLabel(target)} can receive a deposited call`,
      target,
      gasLimit: gasLimit ?? undefined,
      innerCall: innerCall ?? undefined,
    };
  } catch {}

  try {
    const decoded = decodeFunctionData({
      abi: SEND_MESSAGE_ABI,
      data: data as `0x${string}`,
    });
    const target = decoded.args[0] as Address;
    const forward = parseForwardCall(decoded.args[1] as `0x${string}`);
    const innerCall =
      forward?.innerCalldata != null
        ? parseKnownInnerCall(forward.innerCalldata)
        : null;

    return {
      functionName: decoded.functionName,
      prettyName: "Send Cross-Chain Message",
      summary:
        forward && innerCall
          ? `${formatExecutionAddressLabel(target)} can forward a call on ${formatExecutionAddressLabel(
              forward.target
            )} to ${formatInnerCallSummary(innerCall)}`
          : `${formatExecutionAddressLabel(target)} can receive a cross-chain message`,
      target,
      forwardTarget: forward?.target,
      gasLimit: asBigInt(decoded.args[2]) ?? undefined,
      innerCall: innerCall ?? undefined,
    };
  } catch {
    return null;
  }
}

function parseDepositOpaqueData(opaqueData: string): ParsedOpaqueData | null {
  const normalized = opaqueData.toLowerCase().replace(/^0x/, "");
  if (normalized.length < 146) {
    return null;
  }

  return {
    mint: BigInt(`0x${normalized.slice(0, 64)}`),
    value: BigInt(`0x${normalized.slice(64, 128)}`),
    gasLimit: BigInt(`0x${normalized.slice(128, 144)}`),
    isCreation: normalized.slice(144, 146) !== "00",
    data: `0x${normalized.slice(146)}`,
  };
}

function parseForwardCall(calldata: string): ParsedForwardCall | null {
  try {
    const decoded = decodeFunctionData({
      abi: FORWARD_ABI,
      data: calldata as `0x${string}`,
    });

    return {
      target: decoded.args[0] as Address,
      innerCalldata: decoded.args[1] as `0x${string}`,
    };
  } catch {
    return null;
  }
}

function parseKnownInnerCall(calldata: string): ParsedInnerCall | null {
  for (const decoder of INNER_CALL_DECODERS) {
    try {
      const decoded = decodeFunctionData({
        abi: decoder.abi,
        data: calldata as `0x${string}`,
      });
      return {
        functionName: decoded.functionName,
        prettyName: decoder.prettyName,
        recipient: decoded.args[0] as Address,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function formatInnerCallSummary(innerCall: ParsedInnerCall): string {
  const decoder = INNER_CALL_DECODERS.find(
    ({ prettyName }) => prettyName === innerCall.prettyName
  );

  if (!decoder) {
    return `${innerCall.prettyName.toLowerCase()} ${formatExecutionAddressLabel(
      innerCall.recipient
    )}`;
  }

  return decoder.formatSummary(innerCall.recipient);
}

function asArgsRecord(
  args: readonly unknown[] | Record<string, unknown> | null
): ArgsRecord | null {
  if (!args || Array.isArray(args)) {
    return null;
  }
  return args as ArgsRecord;
}

function asAddress(value: unknown): Address | null {
  return typeof value === "string" && isAddressLike(value)
    ? (value as Address)
    : null;
}

function asBigInt(value: unknown): bigint | null {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    return BigInt(value);
  }
  if (typeof value === "string" && value.length > 0) {
    try {
      return value.startsWith("0x") ? BigInt(value) : BigInt(value);
    } catch {
      return null;
    }
  }
  return null;
}

function getBigIntArg(
  args: readonly unknown[] | Record<string, unknown> | null,
  key: string
): bigint | null {
  const record = asArgsRecord(args);
  return record ? asBigInt(record[key]) : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function humanizeLabel(label: string): string {
  return label
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatUnixTime(value: bigint): string {
  const timestamp = Number(value) * 1000;
  if (!Number.isFinite(timestamp)) {
    return value.toString();
  }
  return new Date(timestamp).toLocaleString();
}

function summarizeHex(value: string): string {
  if (value.length <= 26) {
    return value;
  }
  const byteLength = Math.max((value.length - 2) / 2, 0);
  return `${value.slice(0, 10)}…${value.slice(-8)} (${byteLength} bytes)`;
}

function addressField(
  label: string,
  address: Address | null
): ExecutionLogField | null {
  if (!address) {
    return null;
  }
  return {
    label: humanizeLabel(label),
    type: "address",
    value: formatExecutionAddressLabel(address),
    fullValue: address,
    address,
  };
}

function booleanField(label: string, value: boolean): ExecutionLogField | null {
  return {
    label: humanizeLabel(label),
    type: "boolean",
    value: value ? "true" : "false",
  };
}

function hashField(label: string, value: unknown): ExecutionLogField | null {
  const stringified = stringValue(value);
  if (!stringified) {
    return null;
  }
  const summarized = summarizeHex(stringified);
  return {
    label: humanizeLabel(label),
    type: "hash",
    value: summarized,
    fullValue: summarized === stringified ? undefined : stringified,
  };
}

function numberField(label: string, value: unknown): ExecutionLogField | null {
  const bigintValue = asBigInt(value);
  if (bigintValue == null) {
    return null;
  }
  return {
    label: humanizeLabel(label),
    type: "number",
    value: bigintValue.toLocaleString(),
  };
}

function textField(label: string, value: string): ExecutionLogField {
  return {
    label: humanizeLabel(label),
    type: "text",
    value,
  };
}
