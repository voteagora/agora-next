import { beforeEach, describe, expect, it, vi } from "vitest";
import { AbiCoder } from "ethers";
import { createPublicClient, createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import {
  createApprovalVoteAttestation,
  createOptimisticVoteAttestation,
  createVoteAttestation,
  createV2CreateProposalAttestation,
} from "../eas";
import { EAS } from "@ethereum-attestation-service/eas-sdk";

const { getPublicClientMock } = vi.hoisted(() => ({
  getPublicClientMock: vi.fn(),
}));
vi.mock("../viem", () => ({ getPublicClient: getPublicClientMock }));
vi.mock("../tenant/tenant", async () => {
  const { mainnet } = await import("viem/chains");
  return {
    default: {
      current: () => ({
        slug: "syndicate",
        contracts: {
          token: { chain: mainnet },
          easRecipient: "0x73796e6469636174652e000000010100000a2f00",
        },
      }),
    },
  };
});

const account = "0x4288141c2435e9708a6ed76d97c55ed3ac9fd5c2";
const easAddress = "0xa1207f3bba224e2c9c3c6d5af63d0eb1582ce587";
const recipient = "0x73796e6469636174652e000000010100000a2f00";
const proposalId =
  "0x1d164409680d2a983e02b6e8b6445ac8db55b431b3bfa98a83f2f7fe19e3775f";
const hash = `0x${"ab".repeat(32)}`;
const uid = `0x${"cd".repeat(32)}`;
const reason = "Vote by Syndicate Labs";
const abi = new EAS(easAddress).contract.interface;
const coder = AbiCoder.defaultAbiCoder();

const cases = [
  {
    kind: "standard",
    schema:
      "0x12cd8679de42e111a5ece9f2aee44dc8b8351024dea881cda97c2ff5b58349f6",
    encoded: coder.encode(["int8", "string"], [1, reason]),
    cast: createVoteAttestation,
    vote: { choice: 1 },
  },
  {
    kind: "approval",
    schema:
      "0xc4465af5d96b474b1c7a6418500461d3de1fc35552679bf695eb2b3124817dce",
    encoded: coder.encode(["string", "string"], ["0,2", reason]),
    cast: createApprovalVoteAttestation,
    vote: { choices: [0, 2] },
  },
  {
    kind: "optimistic",
    schema:
      "0xc4465af5d96b474b1c7a6418500461d3de1fc35552679bf695eb2b3124817dce",
    encoded: coder.encode(["string", "string"], ["0", reason]),
    cast: createOptimisticVoteAttestation,
    vote: {},
  },
];

function attested(schema: string, attester = account, address = easAddress) {
  const event = abi.encodeEventLog(abi.getEvent("Attested")!, [
    recipient,
    attester,
    uid,
    schema,
  ]);
  return {
    address,
    ...event,
    blockNumber: "0x18cb3a2",
    transactionHash: hash,
    transactionIndex: "0x0",
    blockHash: hash,
    logIndex: "0x0",
    removed: false,
  };
}

function setup(
  schema = cases[0].schema,
  options: {
    chainId?: string;
    status?: string;
    logs?: ReturnType<typeof attested>[];
    reject?: boolean;
  } = {}
) {
  const request = vi.fn(
    async ({ method, params }: { method: string; params?: any }) => {
      if (method === "eth_chainId") return options.chainId ?? "0x1";
      if (method === "eth_accounts") return [account];
      if (method === "eth_blockNumber") return "0x18cb3a2";
      if (method === "eth_estimateGas") return "0x15f1e9";
      if (method === "eth_sendTransaction") {
        if ("gas" in params[0])
          throw new Error("Wallet must estimate smart-account gas");
        if (options.reject)
          throw { code: 4001, message: "User rejected the request" };
        return hash;
      }
      if (method === "eth_getTransactionReceipt")
        return {
          transactionHash: hash,
          blockHash: hash,
          blockNumber: "0x18cb3a2",
          transactionIndex: "0x0",
          from: account,
          to: easAddress,
          cumulativeGasUsed: "0x1677fe",
          gasUsed: "0x1677fe",
          effectiveGasPrice: "0x1",
          contractAddress: null,
          logsBloom: `0x${"00".repeat(256)}`,
          status: options.status ?? "0x1",
          type: "0x2",
          logs: options.logs ?? [attested(schema)],
        };
      throw new Error(`Unexpected RPC method: ${method}`);
    }
  );
  const transport = custom({ request }, { retryCount: 0 });
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport,
  });
  getPublicClientMock.mockReturnValue(
    createPublicClient({ chain: mainnet, transport })
  );
  return { request, walletClient };
}

describe("EAS wallet submission", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(cases)(
    "lets the wallet estimate gas for a $kind vote and returns the attestation UID",
    async ({ schema, encoded, cast, vote }) => {
      const { request, walletClient } = setup(schema);
      const result = await cast({
        ...vote,
        choice: 1,
        choices: [0, 2],
        reason,
        proposalId,
        walletClient,
      });
      const sent = request.mock.calls.find(
        ([call]) => call.method === "eth_sendTransaction"
      )![0].params[0];
      expect(sent).toMatchObject({
        from: account,
        value: "0x0",
      });
      expect(sent.to.toLowerCase()).toBe(easAddress);
      expect(sent).not.toHaveProperty("gas");
      expect(
        request.mock.calls.some(([call]) => call.method === "eth_estimateGas")
      ).toBe(false);
      const [attestation] = abi.decodeFunctionData("attest", sent.data);
      expect(attestation.schema).toBe(schema);
      expect(attestation.data.recipient.toLowerCase()).toBe(recipient);
      expect(attestation.data.refUID).toBe(proposalId);
      expect(attestation.data.revocable).toBe(false);
      expect(attestation.data.expirationTime).toBe(0n);
      expect(attestation.data.data).toBe(encoded);
      expect(result).toMatchObject({
        transactionHash: uid,
        txHash: hash,
        chainId: 1,
        txInputData: sent.data,
      });
    }
  );

  it("uses the same wallet submission for v2 proposal creation", async () => {
    const schema =
      "0x38bfba767c2f41790962f09bcf52923713cfff3ad6d7604de7cc77c15fcf169a";
    const { request, walletClient } = setup(schema);
    const result = await createV2CreateProposalAttestation({
      title: "Proposal",
      description: "Description",
      startts: 1n,
      endts: 2n,
      tags: "",
      proposal_type_uid: proposalId,
      walletClient,
    });
    const sent = request.mock.calls.find(
      ([call]) => call.method === "eth_sendTransaction"
    )![0].params[0];
    expect(sent).not.toHaveProperty("gas");
    const [attestation] = abi.decodeFunctionData("attest", sent.data);
    expect(attestation.data.refUID).toBe(proposalId);
    expect(attestation.data.revocable).toBe(true);
    expect(result.transactionHash).toBe(uid);
  });

  it("rejects a reverted receipt and preserves transaction details for Mirador", async () => {
    const { walletClient } = setup(cases[0].schema, { status: "0x0" });
    await expect(
      createVoteAttestation({ choice: 1, reason, proposalId, walletClient })
    ).rejects.toMatchObject({
      message: "Attestation transaction reverted.",
      txHash: hash,
      chainId: 1,
      txInputData: expect.stringMatching(/^0xf17325e7/),
    });
  });

  it("rejects a successful bundle containing only unrelated attestations", async () => {
    const otherAccount = "0x867842be5c0698fc3627412cd2472bb01ffd6d53";
    const { walletClient } = setup(cases[0].schema, {
      logs: [
        attested(cases[0].schema, otherAccount),
        attested(cases[0].schema, account, otherAccount),
        attested(cases[1].schema),
      ],
    });
    await expect(
      createVoteAttestation({ choice: 1, reason, proposalId, walletClient })
    ).rejects.toThrow("expected attestation");
  });

  it("blocks a wallet on the wrong chain before requesting a transaction", async () => {
    const { request, walletClient } = setup(cases[0].schema, {
      chainId: "0x2105",
    });
    await expect(
      createVoteAttestation({ choice: 1, reason, proposalId, walletClient })
    ).rejects.toThrow("does not match");
    expect(
      request.mock.calls.some(([call]) => call.method === "eth_sendTransaction")
    ).toBe(false);
    expect(getPublicClientMock).not.toHaveBeenCalled();
  });

  it("propagates wallet rejection without waiting for a receipt", async () => {
    const { walletClient } = setup(cases[0].schema, { reject: true });
    await expect(
      createVoteAttestation({ choice: 1, reason, proposalId, walletClient })
    ).rejects.toThrow("User rejected");
    expect(getPublicClientMock).not.toHaveBeenCalled();
  });
});
