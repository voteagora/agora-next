import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveENSTextRecords, resolveEFPStats } from "../ENSUtils";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_ALCHEMY_ID = "test-alchemy-key";
process.env.NEXT_PUBLIC_AGORA_ENV = "dev";

vi.mock("ethers", () => {
  const mockGetText = vi.fn();
  const mockGetResolver = vi.fn();
  const mockLookupAddress = vi.fn();

  (global as any).__mocks = {
    mockGetText,
    mockGetResolver,
    mockLookupAddress,
  };

  return {
    AlchemyProvider: vi.fn().mockImplementation(() => ({
      getResolver: mockGetResolver,
      lookupAddress: mockLookupAddress,
    })),
  };
});

const { mockGetText, mockGetResolver, mockLookupAddress } = (global as any)
  .__mocks;

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}));

global.fetch = vi.fn();

describe("resolveENSTextRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetResolver.mockResolvedValue({
      getText: mockGetText,
    });

    mockLookupAddress.mockResolvedValue("vitalik.eth");
  });

  it("should resolve text records for an ENS name", async () => {
    mockGetText
      .mockResolvedValueOnce("https://twitter.com/vitalik")
      .mockResolvedValueOnce("https://github.com/vitalik")
      .mockResolvedValueOnce("This is a description")
      .mockResolvedValueOnce("This is a location");

    const result = await resolveENSTextRecords("vitalik.eth", [
      "twitter",
      "github",
      "description",
      "location",
    ]);

    expect(result).toEqual({
      twitter: "https://twitter.com/vitalik",
      github: "https://github.com/vitalik",
      description: "This is a description",
      location: "This is a location",
    });
  });

  it("should resolve text records for an address", async () => {
    mockGetText
      .mockResolvedValueOnce("https://twitter.com/vitalik")
      .mockResolvedValueOnce("https://github.com/vitalik")
      .mockResolvedValueOnce("This is a description")
      .mockResolvedValueOnce("This is a location");

    const result = await resolveENSTextRecords("0x123...", [
      "twitter",
      "github",
      "description",
      "location",
    ]);

    expect(result).toEqual({
      twitter: "https://twitter.com/vitalik",
      github: "https://github.com/vitalik",
      description: "This is a description",
      location: "This is a location",
    });
  });

  it("should return null if no resolver is found", async () => {
    mockGetResolver.mockResolvedValue(null);

    const result = await resolveENSTextRecords("nonexistent.eth", ["twitter"]);

    expect(result).toBeNull();
  });

  it("should handle failed text record lookups", async () => {
    mockGetText
      .mockRejectedValueOnce(null)
      .mockResolvedValueOnce("https://github.com/vitalik");

    const result = await resolveENSTextRecords("vitalik.eth", [
      "twitter",
      "github",
    ]);

    expect(result).toEqual({
      github: "https://github.com/vitalik",
    });
  });
});

describe("resolveEFPStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and return EFP stats successfully", async () => {
    const mockStats = {
      following: 100,
      followers: 200,
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockStats),
    });

    const result = await resolveEFPStats("vitalik.eth");

    expect(result).toEqual(mockStats);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.ethfollow.xyz/api/v1/users/vitalik.eth/stats"
    );
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("API Error"));

    const result = await resolveEFPStats("vitalik.eth");
    expect(result).toBeNull();
  });
});
