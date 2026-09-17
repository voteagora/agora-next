import { renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { Eip1193Provider } from "ethers";
import { createVoteAttestation } from "@/lib/eas";
import { useEASV2 } from "../useEASV2";

const { request } = vi.hoisted(() => ({
  request: vi.fn<Eip1193Provider["request"]>(),
}));
const account = "0x4288141c2435e9708a6ed76d97c55ed3ac9fd5c2";
const easAddress = "0xa1207f3bba224e2c9c3c6d5af63d0eb1582ce587";
const hash = `0x${"ab".repeat(32)}`;

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: account }),
  useWalletClient: () => ({ data: { transport: { request } } }),
}));
vi.mock("@tanstack/react-query", () => ({
  useMutation: ({ mutationFn }: { mutationFn: unknown }) => ({
    mutateAsync: mutationFn,
  }),
}));
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      contracts: { token: { chain: { id: 1 } } },
      ui: { toggle: () => ({ enabled: true }) },
    }),
  },
}));
vi.mock("@/lib/eas", () => ({
  createVoteAttestation: vi.fn().mockResolvedValue({}),
  EAS_VOTING_TYPE: {},
  EAS_APPROVAL_CRITERIA: {},
}));
vi.mock("@/lib/mirador/frontendFlowTrace", () => ({
  attachMiradorTransactionArtifacts: vi.fn(),
  closeFrontendMiradorFlowTrace: vi.fn(),
  startFrontendMiradorFlowTrace: vi.fn(),
}));

it("omits only the supplied gas limit and keeps using the connected wallet", async () => {
  request.mockImplementation(async ({ method }) => {
    if (method === "eth_chainId") return "0x1";
    if (method === "eth_accounts") return [account];
    if (method === "eth_estimateGas") return "0x15f1e9";
    if (method === "eth_sendTransaction") return hash;
    if (method === "eth_getTransactionReceipt") return null;
    throw new Error(`Unexpected RPC: ${method}`);
  });
  const { result } = renderHook(() => useEASV2());
  await result.current.createStandardVote({
    choice: 1,
    reason: "Vote by Syndicate Labs",
    proposalId: hash,
  });
  const { signer } = vi.mocked(createVoteAttestation).mock.calls[0][0];
  try {
    const transaction = { to: easAddress, data: "0xf17325e7", value: 0n };
    await expect(signer.sendUncheckedTransaction(transaction)).resolves.toBe(
      hash
    );
    expect(request).toHaveBeenCalledWith({
      method: "eth_estimateGas",
      params: [{ ...transaction, from: account, value: "0x0" }],
    });
    expect(request).toHaveBeenCalledWith({
      method: "eth_sendTransaction",
      params: [{ ...transaction, from: account, value: "0x0" }],
    });
    await signer.provider.send("eth_getTransactionReceipt", [hash]);
    expect(request).toHaveBeenCalledWith({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });
  } finally {
    signer.provider.destroy();
  }
});
