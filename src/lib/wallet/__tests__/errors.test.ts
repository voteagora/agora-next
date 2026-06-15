import { describe, expect, it } from "vitest";

import { getWalletErrorDiagnostics } from "../errors";

describe("getWalletErrorDiagnostics", () => {
  it("extracts viem-style name, code, shortMessage and details", () => {
    const error = Object.assign(new Error("An unknown RPC error occurred."), {
      name: "UnknownRpcError",
      code: 4001,
      shortMessage: "An unknown RPC error occurred.",
      details: "RPC endpoint returned HTTP client error.",
    });

    expect(getWalletErrorDiagnostics(error)).toMatchObject({
      errorName: "UnknownRpcError",
      errorCode: 4001,
      shortMessage: "An unknown RPC error occurred.",
      errorDetails: "RPC endpoint returned HTTP client error.",
    });
  });

  it("walks the cause chain for the HTTP status and host", () => {
    const httpError = Object.assign(new Error("HTTP request failed."), {
      name: "HttpRequestError",
      status: 429,
      url: "https://some-wallet-rpc.example/rpc",
    });
    const error = Object.assign(new Error("An unknown RPC error occurred."), {
      name: "UnknownRpcError",
      cause: httpError,
    });

    expect(getWalletErrorDiagnostics(error)).toMatchObject({
      errorName: "UnknownRpcError",
      httpStatus: 429,
      rpcHost: "some-wallet-rpc.example",
    });
  });

  it("never leaks an RPC secret query — host only", () => {
    const error = Object.assign(new Error("failed"), {
      url: "https://edge.goldsky.com/standard/evm/10?secret=super-secret-value",
    });

    const diagnostics = getWalletErrorDiagnostics(error);

    expect(diagnostics.rpcHost).toBe("edge.goldsky.com");
    expect(JSON.stringify(diagnostics)).not.toContain("super-secret-value");
  });

  it("returns an empty object for non-error inputs", () => {
    expect(getWalletErrorDiagnostics(undefined)).toEqual({});
    expect(getWalletErrorDiagnostics("plain string")).toEqual({});
  });
});
