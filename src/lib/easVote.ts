import {
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import {
  encodeFunctionData,
  isHex,
  parseEventLogs,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { getEASAddress } from "@/lib/constants";
import { VoteSubmissionError } from "@/lib/voteErrorUtils";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/**
 * Minimal EAS ABI for casting a vote attestation. The `attest` signature is
 * identical on EAS v0.26 (mainnet / sepolia) and v1.x (OP-stack predeploys).
 */
export const EAS_ATTEST_ABI = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "event",
    name: "Attested",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "attester", type: "address", indexed: true },
      { name: "uid", type: "bytes32", indexed: false },
      { name: "schemaUID", type: "bytes32", indexed: true },
    ],
  },
] as const;

export const EAS_V2_SCHEMA_IDS = {
  CREATE_PROPOSAL:
    "0x38bfba767c2f41790962f09bcf52923713cfff3ad6d7604de7cc77c15fcf169a",
  VOTE: {
    1: "0x12cd8679de42e111a5ece9f2aee44dc8b8351024dea881cda97c2ff5b58349f6",
    11155111:
      "0x19c36b80a224c4800fd6ed68901ec21f591563c8a5cb2dd95382d430603f91ff",
    8453: "0x72edbb9603b8ff8ae5310c1d33912f4a7998bea0c03afc0e06a64e41d32b78b9",
  } as Record<number, string>,
  ADVANCED_VOTE: {
    1: "0xc4465af5d96b474b1c7a6418500461d3de1fc35552679bf695eb2b3124817dce",
    11155111:
      "0x991b014c62b19364882fc89dbf3baa6104b4598ee2c4f29152be2cbcfcb4cb81",
    8453: "0x72edbb9603b8ff8ae5310c1d33912f4a7998bea0c03afc0e06a64e41d32b78b9",
  } as Record<number, string>,
};

// Schema encoders for EAS v2 vote attestations
export const voteSchemaEncoders = {
  VOTE: new SchemaEncoder("int8 choice,string reason"),
  ADVANCED_VOTE: new SchemaEncoder("string choice,string reason"),
};

export type VoteAttestationKind = "standard" | "approval" | "optimistic";

export type VoteAttestationParams = {
  reason: string;
  proposalId: string;
  chainId: number;
  /** Attestation recipient; the tenant's `easRecipient` (DAO id). */
  recipient?: string;
} & (
  | { kind: "standard"; choice: number } // 0 = against, 1 = for, 2 = abstain
  | { kind: "approval"; choices: number[] }
  | { kind: "optimistic" }
);

export type AttestationRequestData = {
  recipient: Address;
  expirationTime: bigint;
  revocable: boolean;
  refUID: Hex;
  data: Hex;
  value: bigint;
};

export type VoteAttestationRequest = {
  to: Address;
  data: Hex;
  value: 0n;
  chainId: number;
  schema: Hex;
  attestationRequest: { schema: Hex; data: AttestationRequestData };
};

function encodeVoteData(params: VoteAttestationParams): Hex {
  switch (params.kind) {
    case "standard":
      return voteSchemaEncoders.VOTE.encodeData([
        { name: "choice", value: params.choice, type: "int8" },
        { name: "reason", value: params.reason, type: "string" },
      ]) as Hex;
    case "approval":
      return voteSchemaEncoders.ADVANCED_VOTE.encodeData([
        { name: "choice", value: params.choices.join(","), type: "string" },
        { name: "reason", value: params.reason, type: "string" },
      ]) as Hex;
    case "optimistic":
      // "0" = AGAINST / VETO
      return voteSchemaEncoders.ADVANCED_VOTE.encodeData([
        { name: "choice", value: "0", type: "string" },
        { name: "reason", value: params.reason, type: "string" },
      ]) as Hex;
  }
}

function getVoteSchema(
  kind: VoteAttestationKind,
  chainId: number
): string | undefined {
  return kind === "standard"
    ? EAS_V2_SCHEMA_IDS.VOTE[chainId]
    : EAS_V2_SCHEMA_IDS.ADVANCED_VOTE[chainId];
}

const BYTES32_LENGTH = 66;

/**
 * Builds the EAS `attest` calldata for a vote. Pure: no tenant, no signer.
 */
export function buildVoteAttestationRequest(
  params: VoteAttestationParams
): VoteAttestationRequest {
  const { chainId, proposalId } = params;

  const to = getEASAddress(chainId) as Address;
  const schema = getVoteSchema(params.kind, chainId);

  if (to === ZERO_ADDRESS || !schema) {
    throw new VoteSubmissionError(
      "UNSUPPORTED_CHAIN",
      `Voting is not supported on chain ${chainId}`,
      { chainId }
    );
  }

  if (!isHex(proposalId) || proposalId.length !== BYTES32_LENGTH) {
    throw new VoteSubmissionError(
      "INVALID_PROPOSAL",
      "This proposal cannot be voted on: invalid proposal id",
      { chainId }
    );
  }

  const attestationRequest = {
    schema: schema as Hex,
    data: {
      recipient: (params.recipient || ZERO_ADDRESS) as Address,
      expirationTime: NO_EXPIRATION,
      revocable: false,
      refUID: proposalId,
      data: encodeVoteData(params),
      value: 0n,
    },
  };

  const data = encodeFunctionData({
    abi: EAS_ATTEST_ABI,
    functionName: "attest",
    args: [attestationRequest],
  });

  return {
    to,
    data,
    value: 0n,
    chainId,
    schema: schema as Hex,
    attestationRequest,
  };
}

/**
 * Reads the attestation UID out of an `Attested` log emitted by the EAS
 * contract in the given receipt.
 */
export function parseAttestationUidFromReceipt(
  receipt: Pick<TransactionReceipt, "logs">,
  easAddress: Address
): Hex | undefined {
  const logs = parseEventLogs({
    abi: EAS_ATTEST_ABI,
    eventName: "Attested",
    logs: receipt.logs,
  });

  const match = logs.find(
    (log) => log.address.toLowerCase() === easAddress.toLowerCase()
  );

  return match?.args.uid;
}

const TX_HASH_PATTERN = /^0x[0-9a-f]{64}$/i;

export function isTransactionHash(value: unknown): value is Hex {
  return typeof value === "string" && TX_HASH_PATTERN.test(value);
}
