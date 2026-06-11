import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  addMiradorSafeTxHintMock,
  addMiradorTxHintMock,
  isSafeWalletMock,
  useAccountMock,
} = vi.hoisted(() => ({
  addMiradorSafeTxHintMock: vi.fn(),
  addMiradorTxHintMock: vi.fn(),
  isSafeWalletMock: vi.fn(),
  useAccountMock: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: useAccountMock,
}));

vi.mock("@/lib/utils", () => ({
  isSafeWallet: isSafeWalletMock,
}));

vi.mock("@/lib/mirador/config", () => ({
  isMiradorFlowTracingEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: vi.fn(),
  addMiradorSafeTxHint: addMiradorSafeTxHintMock,
  addMiradorTxHint: addMiradorTxHintMock,
  addMiradorTxInputData: vi.fn(),
  closeMiradorTrace: vi.fn(),
  startMiradorTrace: vi.fn(),
}));

import { useAttachMiradorSubmittedTxHash } from "@/lib/mirador/frontendFlowTrace";

type HookProps = Parameters<typeof useAttachMiradorSubmittedTxHash>[0];

const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111";

const flushAsyncWork = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe("useAttachMiradorSubmittedTxHash", () => {
  const trace = { id: "trace" } as any;

  const buildProps = (overrides: Partial<HookProps> = {}): HookProps => ({
    traceRef: { current: trace },
    txHash: "0xaaa",
    chainId: 1,
    details: "Submitted test transaction",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useAccountMock.mockReturnValue({ address: WALLET_ADDRESS });
    isSafeWalletMock.mockResolvedValue(false);
  });

  it("attaches the hash once as an evm hint when it becomes defined", async () => {
    renderHook((props: HookProps) => useAttachMiradorSubmittedTxHash(props), {
      initialProps: buildProps(),
    });

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1)
    );
    expect(addMiradorTxHintMock).toHaveBeenCalledWith(
      trace,
      "0xaaa",
      "ethereum",
      "Submitted test transaction"
    );
    expect(isSafeWalletMock).toHaveBeenCalledWith(WALLET_ADDRESS, 1);
    expect(addMiradorSafeTxHintMock).not.toHaveBeenCalled();
  });

  it("does not re-attach the same hash on re-render", async () => {
    const { rerender } = renderHook(
      (props: HookProps) => useAttachMiradorSubmittedTxHash(props),
      { initialProps: buildProps() }
    );

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1)
    );

    rerender(buildProps());
    await flushAsyncWork();

    expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1);
  });

  it("attaches a new hash after the watched hash changes", async () => {
    const { rerender } = renderHook(
      (props: HookProps) => useAttachMiradorSubmittedTxHash(props),
      { initialProps: buildProps() }
    );

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1)
    );

    rerender(buildProps({ txHash: "0xbbb" }));

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(2)
    );
    expect(addMiradorTxHintMock).toHaveBeenLastCalledWith(
      trace,
      "0xbbb",
      "ethereum",
      "Submitted test transaction"
    );
  });

  it("respects the enabled flag", async () => {
    const { rerender } = renderHook(
      (props: HookProps) => useAttachMiradorSubmittedTxHash(props),
      { initialProps: buildProps({ enabled: false }) }
    );

    await flushAsyncWork();
    expect(addMiradorTxHintMock).not.toHaveBeenCalled();

    rerender(buildProps({ enabled: true }));

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1)
    );
  });

  it("routes Safe wallets through the safe tx hint", async () => {
    isSafeWalletMock.mockResolvedValue(true);

    renderHook((props: HookProps) => useAttachMiradorSubmittedTxHash(props), {
      initialProps: buildProps(),
    });

    await vi.waitFor(() =>
      expect(addMiradorSafeTxHintMock).toHaveBeenCalledTimes(1)
    );
    expect(addMiradorSafeTxHintMock).toHaveBeenCalledWith(
      trace,
      "0xaaa",
      "ethereum",
      "Submitted test transaction"
    );
    expect(addMiradorTxHintMock).not.toHaveBeenCalled();
  });

  it("falls back to an evm hint without probing when no address is connected", async () => {
    useAccountMock.mockReturnValue({ address: undefined });

    renderHook((props: HookProps) => useAttachMiradorSubmittedTxHash(props), {
      initialProps: buildProps(),
    });

    await vi.waitFor(() =>
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1)
    );
    expect(isSafeWalletMock).not.toHaveBeenCalled();
  });

  it("attaches nothing without a trace or hash", async () => {
    const { rerender } = renderHook(
      (props: HookProps) => useAttachMiradorSubmittedTxHash(props),
      { initialProps: buildProps({ traceRef: { current: null } }) }
    );

    rerender(buildProps({ txHash: undefined }));
    await flushAsyncWork();

    expect(addMiradorTxHintMock).not.toHaveBeenCalled();
    expect(addMiradorSafeTxHintMock).not.toHaveBeenCalled();
  });
});
