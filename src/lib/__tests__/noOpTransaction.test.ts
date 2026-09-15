import { describe, expect, it } from "vitest";
import {
  NO_OP_TIMELOCK_CALLDATA,
  isNoOpTransaction,
  stripNoOpTransactions,
} from "../noOpTransaction";
import { ZERO_ADDRESS } from "../constants";

const TIMELOCK = "0x495177B4B20aA4f429445684bfabC3534B5a2Db1";

describe("isNoOpTransaction", () => {
  it("detects the timelock getMinDelay placeholder", () => {
    expect(
      isNoOpTransaction(
        {
          target: TIMELOCK.toLowerCase(),
          calldata: NO_OP_TIMELOCK_CALLDATA,
          value: "0",
        },
        TIMELOCK
      )
    ).toBe(true);
  });

  it("detects the zero-address empty placeholder", () => {
    expect(
      isNoOpTransaction({ target: ZERO_ADDRESS, calldata: "0x", value: 0 })
    ).toBe(true);
  });

  it("does not match a real call on the timelock", () => {
    expect(
      isNoOpTransaction(
        { target: TIMELOCK, calldata: "0xa9059cbb", value: "0" },
        TIMELOCK
      )
    ).toBe(false);
  });

  it("does not match a placeholder that transfers value", () => {
    expect(
      isNoOpTransaction(
        { target: TIMELOCK, calldata: NO_OP_TIMELOCK_CALLDATA, value: "1" },
        TIMELOCK
      )
    ).toBe(false);
  });

  it("does not match getMinDelay on a non-timelock address", () => {
    expect(
      isNoOpTransaction(
        { target: ZERO_ADDRESS, calldata: NO_OP_TIMELOCK_CALLDATA, value: 0 },
        TIMELOCK
      )
    ).toBe(false);
  });
});

describe("stripNoOpTransactions", () => {
  it("removes only the placeholder and keeps arrays aligned", () => {
    const result = stripNoOpTransactions(
      {
        targets: [TIMELOCK, "0x1111111111111111111111111111111111111111"],
        calldatas: [NO_OP_TIMELOCK_CALLDATA, "0xa9059cbb"],
        values: ["0", "0"],
        signatures: ["", "transfer(address,uint256)"],
        descriptions: ["noop", "send"],
      },
      TIMELOCK
    );
    expect(result.targets).toEqual([
      "0x1111111111111111111111111111111111111111",
    ]);
    expect(result.calldatas).toEqual(["0xa9059cbb"]);
    expect(result.values).toEqual(["0"]);
    expect(result.signatures).toEqual(["transfer(address,uint256)"]);
    expect(result.descriptions).toEqual(["send"]);
  });

  it("returns empty arrays for a signal-only proposal", () => {
    const result = stripNoOpTransactions(
      {
        targets: [TIMELOCK],
        calldatas: [NO_OP_TIMELOCK_CALLDATA],
        values: ["0"],
      },
      TIMELOCK
    );
    expect(result.targets).toEqual([]);
    expect(result.calldatas).toEqual([]);
    expect(result.values).toEqual([]);
  });

  it("returns the input unchanged when nothing is a placeholder", () => {
    const input = {
      targets: ["0x1111111111111111111111111111111111111111"],
      calldatas: ["0xa9059cbb"],
      values: ["0"],
    };
    expect(stripNoOpTransactions(input, TIMELOCK)).toBe(input);
  });
});
