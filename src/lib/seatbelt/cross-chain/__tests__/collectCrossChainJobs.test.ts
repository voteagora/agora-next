import { encodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";

import { BridgeKind } from "../../types";
import { collectCrossChainJobs } from "../adapter";

describe("collectCrossChainJobs", () => {
  it("extracts Arbitrum retryable ticket jobs", () => {
    const calldata = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "createRetryableTicket",
          inputs: [
            { name: "to", type: "address" },
            { name: "l2CallValue", type: "uint256" },
            { name: "maxSubmissionCost", type: "uint256" },
            { name: "excessFeeRefundAddress", type: "address" },
            { name: "callValueRefundAddress", type: "address" },
            { name: "gasLimit", type: "uint256" },
            { name: "maxFeePerGas", type: "uint256" },
            { name: "data", type: "bytes" },
          ],
          outputs: [{ name: "ticketId", type: "uint256" }],
          stateMutability: "payable",
        },
      ],
      functionName: "createRetryableTicket",
      args: [
        "0x2222222222222222222222222222222222222222",
        0n,
        0n,
        "0x3333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444",
        1000000n,
        0n,
        "0x",
      ],
    });

    const jobs = collectCrossChainJobs([calldata]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].bridge).toBe(BridgeKind.ARBITRUM_RETRYABLE);
    expect(jobs[0].destinationChainId).toBe(42161);
    expect(jobs[0].steps).toHaveLength(1);
  });

  it("extracts Optimism sendMessage jobs", () => {
    const inner = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "mint",
          inputs: [
            { name: "to", type: "address" },
            { name: "amt", type: "uint256" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "mint",
      args: ["0x5555555555555555555555555555555555555555", 1n],
    });

    const calldata = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "sendMessage",
          inputs: [
            { name: "_target", type: "address" },
            { name: "_message", type: "bytes" },
            { name: "_gasLimit", type: "uint32" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "sendMessage",
      args: ["0x6666666666666666666666666666666666666666", inner, 1_000_000],
    });

    const jobs = collectCrossChainJobs([calldata]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].bridge).toBe(BridgeKind.OPTIMISM_SEND_MESSAGE);
    expect(jobs[0].destinationChainId).toBe(10);
  });

  it("extracts Wormhole publishMessage markers", () => {
    const calldata = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "publishMessage",
          inputs: [
            { name: "nonce", type: "uint32" },
            { name: "payload", type: "bytes" },
            { name: "consistencyLevel", type: "uint8" },
          ],
          outputs: [{ name: "sequence", type: "uint64" }],
          stateMutability: "payable",
        },
      ],
      functionName: "publishMessage",
      args: [1, "0xabcd", 15],
    });

    const jobs = collectCrossChainJobs([calldata]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].bridge).toBe(BridgeKind.WORMHOLE);
    expect(jobs[0].steps).toHaveLength(0);
  });

  it("counts multiple bridge actions", () => {
    const arb = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "createRetryableTicket",
          inputs: [
            { name: "to", type: "address" },
            { name: "l2CallValue", type: "uint256" },
            { name: "maxSubmissionCost", type: "uint256" },
            { name: "excessFeeRefundAddress", type: "address" },
            { name: "callValueRefundAddress", type: "address" },
            { name: "gasLimit", type: "uint256" },
            { name: "maxFeePerGas", type: "uint256" },
            { name: "data", type: "bytes" },
          ],
          outputs: [{ name: "ticketId", type: "uint256" }],
          stateMutability: "payable",
        },
      ],
      functionName: "createRetryableTicket",
      args: [
        "0x2222222222222222222222222222222222222222",
        0n,
        0n,
        "0x3333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444",
        1000000n,
        0n,
        "0x",
      ],
    });

    const noop = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "transfer",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "transfer",
      args: ["0x7777777777777777777777777777777777777777", 1n],
    });

    const jobs = collectCrossChainJobs([noop, arb]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourceActionIndex).toBe(1);
  });
});
