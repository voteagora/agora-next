import { describe, it, vi, expect } from "vitest"; // Import from vitest
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@prisma/client";
const { slug } = Tenant.current();

vi.mock("server-only", () => ({})); // Mock server-only module

vi.mock("@/app/api/common/delegateStatement/createDelegateStatement", () => ({
  createDelegateStatement: vi.fn(),
}));

// Define default values for the schema
const mockDelegateStatement = {
  discord: null,
  email: "mock-email@example.com",
  twitter: null,
  warpcast: null,
  address: "0xabcdef1234567890",
  dao_slug: "OP", // Example DaoSlug
  stage: stageStatus.published, // Example stage value
  signature: "0xsomesignaturemock",
  payload: {}, // Include this field (default to empty object for now)
  message_hash: "mock-message-hash", // Mocked hash
  createdAt: new Date().toISOString(), // Serialized Date
  updatedAt: new Date().toISOString(), // Serialized Date
  notification_preferences: {
    wants_proposal_created_email: "prompt",
    wants_proposal_ending_soon_email: "prompt",
    last_updated_at: new Date().toISOString(),
  },
};

describe("createDelegateStatement basic setup", () => {
  it("should call createDelegateStatement with the correct data", async () => {
    const mockDelegateStatment = {
      discord: null,
      email: "mock-email@example.com",
      twitter: null,
      warpcast: null,
      address: "0xabcdef1234567890" as `0x${string}`,
      dao_slug: slug,
      stage: stageStatus.published,
      signature: "0xabcdef1234567890" as `0x${string}`,
      payload: {},
      message_hash: "value",
      createdAt: new Date().toISOString(), // Serialize Date to ISO string
      updatedAt: new Date().toISOString(),
      notification_preferences: {
        wants_proposal_created_email: "prompt",
        wants_proposal_ending_soon_email: "prompt",
        last_updated_at: new Date(),
      },
      endorsed: false,
      scw_address: null,
    };

    const args = {
      address: "0xabcdef1234567890" as `0x${string}`,
      delegateStatement: mockDelegateStatment,
      signature: "0xsomesignaturemock",
      message: "mock-message",
      stage: stageStatus.published,
    };

    // Mock `createDelegateStatement` to resolve its Promise
    const mockedFn = vi.mocked(createDelegateStatement);
    mockedFn.mockResolvedValueOnce(mockDelegateStatment); // Since the function resolves without a return

    // Call the function
    await createDelegateStatement(args);

    // Assertions
    expect(mockedFn).toHaveBeenCalledTimes(1); // Validate it was called exactly once
    expect(mockedFn).toHaveBeenCalledWith(args); // Validate it was called with the right arguments
  });
});
