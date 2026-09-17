import { describe, expect, it } from "vitest";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { decodeFunctionData, encodeEventTopics, type Hex } from "viem";
import {
  buildVoteAttestationRequest,
  EAS_ATTEST_ABI,
  EAS_V2_SCHEMA_IDS,
  isTransactionHash,
  parseAttestationUidFromReceipt,
  voteSchemaEncoders,
} from "@/lib/easVote";
import { VoteSubmissionError } from "@/lib/voteErrorUtils";

const PROPOSAL_ID =
  "0x1111111111111111111111111111111111111111111111111111111111111111";
const RECIPIENT = "0x73796e6469636174652e000000010100000a2f00";
const MAINNET_EAS = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";
const SEPOLIA_EAS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";

function decode(data: Hex) {
  const decoded = decodeFunctionData({ abi: EAS_ATTEST_ABI, data });
  return decoded.args[0];
}

describe("buildVoteAttestationRequest", () => {
  it("builds a standard vote on mainnet", () => {
    const request = buildVoteAttestationRequest({
      kind: "standard",
      choice: 1,
      reason: "gm",
      proposalId: PROPOSAL_ID,
      chainId: 1,
      recipient: RECIPIENT,
    });

    expect(request.to).toBe(MAINNET_EAS);
    expect(request.chainId).toBe(1);
    expect(request.value).toBe(0n);
    expect(request.schema).toBe(EAS_V2_SCHEMA_IDS.VOTE[1]);

    const args = decode(request.data);
    expect(args.schema).toBe(EAS_V2_SCHEMA_IDS.VOTE[1]);
    expect(args.data.recipient.toLowerCase()).toBe(RECIPIENT.toLowerCase());
    expect(args.data.refUID).toBe(PROPOSAL_ID);
    expect(args.data.revocable).toBe(false);
    expect(args.data.expirationTime).toBe(0n);
    expect(args.data.value).toBe(0n);

    const decoded = new SchemaEncoder("int8 choice,string reason").decodeData(
      args.data.data
    );
    expect(decoded[0].value.value).toBe(1n);
    expect(decoded[1].value.value).toBe("gm");
  });

  it("builds approval and optimistic votes with the advanced schema on sepolia", () => {
    const approval = buildVoteAttestationRequest({
      kind: "approval",
      choices: [0, 2, 3],
      reason: "",
      proposalId: PROPOSAL_ID,
      chainId: 11155111,
    });
    expect(approval.to).toBe(SEPOLIA_EAS);
    const approvalArgs = decode(approval.data);
    expect(approvalArgs.schema).toBe(EAS_V2_SCHEMA_IDS.ADVANCED_VOTE[11155111]);
    expect(approvalArgs.data.recipient).toBe(
      "0x0000000000000000000000000000000000000000"
    );
    expect(
      voteSchemaEncoders.ADVANCED_VOTE.decodeData(approvalArgs.data.data)[0]
        .value.value
    ).toBe("0,2,3");

    const optimistic = buildVoteAttestationRequest({
      kind: "optimistic",
      reason: "veto",
      proposalId: PROPOSAL_ID,
      chainId: 11155111,
    });
    const optimisticArgs = decode(optimistic.data);
    const decoded = voteSchemaEncoders.ADVANCED_VOTE.decodeData(
      optimisticArgs.data.data
    );
    expect(decoded[0].value.value).toBe("0");
    expect(decoded[1].value.value).toBe("veto");
  });

  it("produces the same calldata as the eas-sdk", async () => {
    const request = buildVoteAttestationRequest({
      kind: "standard",
      choice: 0,
      reason: "same bytes",
      proposalId: PROPOSAL_ID,
      chainId: 1,
      recipient: RECIPIENT,
    });

    // The SDK only checks that a signer with sendTransaction is attached; it
    // does not use it to populate the tx.
    const fakeSigner = { sendTransaction: async () => undefined };
    const eas = new EAS(MAINNET_EAS, { signer: fakeSigner as any });
    const sdkTx = await eas.attest({
      schema: EAS_V2_SCHEMA_IDS.VOTE[1],
      data: {
        recipient: RECIPIENT,
        expirationTime: 0n,
        revocable: false,
        refUID: PROPOSAL_ID,
        data: voteSchemaEncoders.VOTE.encodeData([
          { name: "choice", value: 0, type: "int8" },
          { name: "reason", value: "same bytes", type: "string" },
        ]),
        value: 0n,
      },
    });

    expect(sdkTx.data.data?.toLowerCase()).toBe(request.data.toLowerCase());
    expect(sdkTx.data.to?.toLowerCase()).toBe(request.to.toLowerCase());
  });

  it("rejects unsupported chains and malformed proposal ids", () => {
    expect(() =>
      buildVoteAttestationRequest({
        kind: "standard",
        choice: 1,
        reason: "",
        proposalId: PROPOSAL_ID,
        chainId: 999999,
      })
    ).toThrowError(VoteSubmissionError);

    try {
      buildVoteAttestationRequest({
        kind: "standard",
        choice: 1,
        reason: "",
        proposalId: "not-a-uid",
        chainId: 1,
      });
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(VoteSubmissionError);
      expect((error as VoteSubmissionError).code).toBe("INVALID_PROPOSAL");
      expect((error as VoteSubmissionError).chainId).toBe(1);
    }
  });
});

describe("parseAttestationUidFromReceipt", () => {
  it("reads the uid from the EAS Attested log", () => {
    const uid =
      "0xabababababababababababababababababababababababababababababababab";
    const topics = encodeEventTopics({
      abi: EAS_ATTEST_ABI,
      eventName: "Attested",
      args: {
        recipient: RECIPIENT,
        attester: "0x2222222222222222222222222222222222222222",
        schemaUID: EAS_V2_SCHEMA_IDS.VOTE[1] as Hex,
      },
    });
    const receipt = {
      logs: [
        {
          address: MAINNET_EAS.toLowerCase(),
          topics,
          data: uid,
          blockHash: "0x",
          blockNumber: 1n,
          logIndex: 0,
          transactionHash: "0x",
          transactionIndex: 0,
          removed: false,
        },
      ],
    } as any;

    expect(parseAttestationUidFromReceipt(receipt, MAINNET_EAS)).toBe(uid);
    expect(
      parseAttestationUidFromReceipt(
        receipt,
        "0x3333333333333333333333333333333333333333"
      )
    ).toBeUndefined();
  });
});

describe("isTransactionHash", () => {
  it("accepts 32-byte hex and rejects everything else", () => {
    expect(isTransactionHash(PROPOSAL_ID)).toBe(true);
    expect(
      isTransactionHash(PROPOSAL_ID.toUpperCase().replace("0X", "0x"))
    ).toBe(true);
    expect(isTransactionHash("0x1234")).toBe(false);
    expect(isTransactionHash(`${PROPOSAL_ID}00`)).toBe(false);
    expect(isTransactionHash(undefined)).toBe(false);
    expect(isTransactionHash("bundle-id-123")).toBe(false);
  });
});
