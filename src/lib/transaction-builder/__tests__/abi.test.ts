import { describe, it, expect, vi } from "vitest";
import { parseABI, encodeTransaction } from "../abi";

describe("Transaction Builder ABI Utils", () => {
  const ERC20_ABI = [
    {
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const ERC20_ABI_JSON = JSON.stringify(ERC20_ABI);

  describe("parseABI", () => {
    it("should parse a valid JSON ABI string", () => {
      const result = parseABI("0x123", ERC20_ABI_JSON);
      expect(result.address).toBe("0x123");
      // Should filter out view functions (balanceOf)
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe("transfer");
      expect(result.functions[0].signature).toBe("transfer(address,uint256)");
    });

    it("should handle valid ABI object directly", () => {
      const result = parseABI("0x123", ERC20_ABI);
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe("transfer");
    });

    it("should return empty if parsing fails", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = parseABI("0x123", "invalid-json");
      expect(result.functions).toHaveLength(0);
      spy.mockRestore();
    });
  });

  describe("encodeTransaction", () => {
    it("should encode a standard transfer function correctly", () => {
      const to = "0x0000000000000000000000000000000000001234";
      const amount = "1000000000000000000"; // 1 ETH

      const calldata = encodeTransaction("transfer", [to, amount], ERC20_ABI);

      // selectort (4 bytes) + 32 bytes address + 32 bytes uint
      expect(calldata).toMatch(/^0xa9059cbb/); // transfer selector
      expect(calldata.length).toBe(2 + 8 + 64 + 64); // 0x + 8 chars + 64 chars + 64 chars
    });

    it("should throw if args are invalid", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        // Missing second arg
        encodeTransaction("transfer", ["0x123"], ERC20_ABI);
      }).toThrow();
      spy.mockRestore();
    });
  });
});
