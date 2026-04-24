import { describe, expect, it } from "vitest";
import {
  buildExecutionLogPresentation,
  pairExecutionLogsForDisplay,
} from "@/lib/execution/logPresentation";
import type { DecodedExecutionLog } from "@/hooks/useExecutionTxLogs";

describe("pairExecutionLogsForDisplay", () => {
  it("merges SentMessageExtension1 into the preceding SentMessage", () => {
    const logs = [
      {
        logIndex: 1,
        address: "0x1ac1181fc4e4f877963680587aeaa2c90d7ebb95",
        blockNumber: 1n,
        eventName: "SentMessage",
        args: {
          target: "0x044aAF330d7fD6AE683EEc5c1C1d1fFf5196B6b7",
          sender: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
          message: "0x",
          messageNonce: 1n,
          gasLimit: 200000n,
        },
        byAbi: true,
        decodeSource: "knownAbi" as const,
        raw: {
          topics: [],
          data: "0x",
        },
      },
      {
        logIndex: 2,
        address: "0x1ac1181fc4e4f877963680587aeaa2c90d7ebb95",
        blockNumber: 1n,
        eventName: "SentMessageExtension1",
        args: {
          sender: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
          value: 5n,
        },
        byAbi: true,
        decodeSource: "knownAbi" as const,
        raw: {
          topics: [],
          data: "0x",
        },
      },
    ] satisfies DecodedExecutionLog[];

    const paired = pairExecutionLogsForDisplay(logs);

    expect(paired).toHaveLength(1);
    expect(paired[0]?.pairedValue).toBe(5n);
  });
});

describe("buildExecutionLogPresentation", () => {
  it("summarizes timelock deposit actions with friendly labels", () => {
    const log: Parameters<typeof buildExecutionLogPresentation>[0] = {
      logIndex: 1466,
      address: "0x1a9c8182c09f50c8318d769245bea52c32be35bc",
      blockNumber: 24606209n,
      eventName: "ExecuteTransaction",
      args: {
        txHash:
          "0x2e65149703e77c30855a767be473ab29c2c49b9b18b4950a224553e30ff41677",
        target: "0x88e529A6ccd302c948689Cd5156C83D4614FAE92",
        value: 0n,
        signature: "",
        data: "0xe9e05c4200000000000000000000000042ae7ec7ff020412639d443e245d936429fbe71700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030d40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000002413af403500000000000000000000000047cf920815344fd684a48bbefcbfbed9c7ae09cf00000000000000000000000000000000000000000000000000000000",
        eta: 1772892611n,
      },
      byAbi: true,
      decodeSource: "knownAbi" as const,
      raw: {
        topics: [],
        data: "0x",
      },
      pairedValue: null,
    };

    const presentation = buildExecutionLogPresentation(log);

    expect(presentation.title).toBe("Execute transaction");
    expect(presentation.summary).toContain("Soneium V3 Factory");
    expect(presentation.summary).toContain(
      "set owner to Soneium V3 Open Fee Adapter"
    );
  });

  it("decodes deposited opaque data into a readable action summary", () => {
    const log: Parameters<typeof buildExecutionLogPresentation>[0] = {
      logIndex: 1465,
      address: "0x88e529a6ccd302c948689cd5156c83d4614fae92",
      blockNumber: 24606209n,
      eventName: "TransactionDeposited",
      args: {
        from: "0x2BAD8182C09F50c8318d769245beA52C32Be46CD",
        to: "0x42aE7Ec7ff020412639d443E245D936429Fbe717",
        version: 0n,
        opaqueData:
          "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030d400013af403500000000000000000000000047cf920815344fd684a48bbefcbfbed9c7ae09cf",
      },
      byAbi: true,
      decodeSource: "knownAbi" as const,
      raw: {
        topics: [],
        data: "0x",
      },
      pairedValue: null,
    };

    const presentation = buildExecutionLogPresentation(log);

    expect(presentation.title).toBe("Deposit Transaction");
    expect(presentation.summary).toContain("Soneium V3 Factory");
    expect(presentation.summary).toContain(
      "set owner to Soneium V3 Open Fee Adapter"
    );
  });
});
