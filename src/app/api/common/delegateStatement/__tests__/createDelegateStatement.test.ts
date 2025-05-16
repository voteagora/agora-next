import { describe, it, vi, expect, beforeEach, afterEach } from "vitest"; // Import from vitest
import {
  createDelegateStatement,
  publishDelegateStatementDraft,
} from "@/app/api/common/delegateStatement/createDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
const { slug } = Tenant.current();
import { prismaWeb2Client } from "@/app/lib/prisma";
import { createHash } from "crypto";
import { setDefaultValues } from "@/app/api/common/delegateStatement/__tests__/sharedTestInfra";

import { getDraftMessageHash } from "@/app/api/common/delegateStatement/createDelegateStatement";
import { deleteDelegateStatement } from "@/app/api/common/delegateStatement/deleteDelegateStatement";
import {
  getDelegateStatement,
  getDelegateStatements,
} from "@/app/api/common/delegateStatement/getDelegateStatement";

vi.mock("server-only", () => ({})); // Mock server-only module

// vi.mock("@/app/api/common/delegateStatement/createDelegateStatement", () => ({
//   createDelegateStatement: vi.fn(),
// }));

// Because we aren't signing a message onchain, we cannot verify, and most skip over this check.
vi.mock("@/lib/serverVerifyMessage", () => ({
  default: vi.fn(),
}));

// Add some default values that are refrenced multiple times
const mockAddress =
  "0xcC0B26236AFa80673b0859312a7eC16d2b72C1e4" as `0x${string}`;
const mockStage = stageStatus.PUBLISHED as stageStatus;
const mockMessage = "test";

// Define default values for the schema
const mockDelegateStatement = {
  address: mockAddress,
  stage: mockStage,
  created_at: Date.now(),
  discord: "discord",
  endorsed: false,
  payload: { delegateStatement: "A delegate, I am" },
  signature: "0xstring" as `0x${string}`,
  twitter: "twitter",
  updated_at: Date.now(),
  warpcast: "warpcast",
  scw_address: null,
  email: null,
  notification_preferences: {
    wants_proposal_created_email: "prompt",
    wants_proposal_ending_soon_email: "prompt",
    last_updated_at: Date.now(),
  },
};

const mockDelegateStatementFV = setDefaultValues(mockDelegateStatement);

describe("createDelegateStatement", () => {
  it("should create a record in the database", async () => {
    const args = {
      address: mockAddress,
      delegateStatement: mockDelegateStatementFV,
      signature: "0xsomesignaturemock" as `0x${string}`,
      message: mockMessage,
      stage: mockStage,
    };
    const mockVerifyMessage = vi.mocked(verifyMessage);
    mockVerifyMessage.mockResolvedValueOnce(true);

    // call the function
    const result = await createDelegateStatement(args);

    const messageHash = createHash("sha256").update(args.message).digest("hex");

    // Assert the record exists and matches the input data
    expect(result?.address.toLowerCase()).toBe(args.address.toLowerCase());
    expect(result?.dao_slug).toBe(slug);
    expect(result?.stage).toBe(args.stage);
    expect(result?.signature).toBe(args.signature);
    expect(result?.message_hash).toBe(messageHash);
    expect(result?.payload).toEqual(args.delegateStatement);

    // clean up after ourselves
    console.log("cleaning up");
    console.log(
      `Address: ${args.address}, DAO Slug: ${slug}, Message Hash: ${messageHash}, Stage: ${args.stage}`
    );
    await prismaWeb2Client.delegateStatements.delete({
      where: {
        address_dao_slug_message_hash: {
          address: args.address.toLowerCase(),
          dao_slug: slug,
          message_hash: messageHash,
        },
      },
    });
  });
});

describe("getDraftMessage", () => {
  it("should return the message hash on a successful result", async () => {
    const messageHash = createHash("sha256").update(mockMessage).digest("hex");

    const response = await getDraftMessageHash(mockAddress);

    console.log("response:", response);
    console.log("messageHash:", messageHash);

    expect(response!!.toLowerCase()).toBe(messageHash.toLowerCase());
  });
  it("should return null on a failed result", async () => {
    const response = await getDraftMessageHash(
      "0x0000000000000000000000000000000000000000"
    );
    expect(response).toBe(null);
  });
});

describe("publishDelegateStatementDraft", () => {
  const messageHash = createHash("sha256").update(mockMessage).digest("hex");

  beforeEach(async () => {
    // Create a delegate statement
    const args = {
      address: mockAddress,
      delegateStatement: mockDelegateStatementFV,
      signature: "0xsomesignaturemock" as `0x${string}`,
      message: mockMessage,
      // Ensure we pass a draft stage
      stage: stageStatus.DRAFT as stageStatus,
    };
    const mockVerifyMessage = vi.mocked(verifyMessage);
    mockVerifyMessage.mockResolvedValueOnce(true);

    // Create a Delegate Statement
    await createDelegateStatement(args);
  });

  afterEach(async () => {
    // Delete the delegate statements to clean up
    await deleteDelegateStatement({
      address: mockAddress,
      messageHash: messageHash,
    });
  });
  it("should publish a draft with a message hash", async () => {
    // Given an address and a message hash, flip the stage to 'published'

    // The delegate statement should be draft before our call
    const preResult = await getDelegateStatement(mockAddress, {
      type: "MESSAGE_HASH",
      value: messageHash,
    });

    expect(preResult!!.stage).toBe(stageStatus.DRAFT);

    // Call utility function
    await publishDelegateStatementDraft({
      address: mockAddress,
      messageOrMessageHash: { type: "MESSAGE_HASH", value: messageHash },
    });

    // Check the delegate statement is now published
    const postResult = await getDelegateStatement(mockAddress, {
      type: "MESSAGE_HASH",
      value: messageHash,
    });

    expect(postResult!!.stage).toBe(stageStatus.PUBLISHED);
  });
  it("Should publish a draft with a message", async () => {
    // Given an address and a message hash, flip the stage to 'published'

    // The delegate statement should be draft before our call
    const preResult = await getDelegateStatement(mockAddress, {
      type: "MESSAGE_HASH",
      value: messageHash,
    });

    expect(preResult!!.stage).toBe(stageStatus.DRAFT);

    // Call utility function with a non-hash message
    await publishDelegateStatementDraft({
      address: mockAddress,
      messageOrMessageHash: {
        type: "MESSAGE",
        value: mockMessage,
      },
    });

    // Check the delegate statement is now published
    const postResult = await getDelegateStatement(mockAddress, {
      type: "MESSAGE_HASH",
      value: messageHash,
    });

    expect(postResult!!.stage).toBe(stageStatus.PUBLISHED);
  });

  it("Gracefully handles a non-existent message", async () => {
    // Call utility function with a message that doesn't exist - non-hashed
    const nonExistentMessage = "Non-existent message";
    const nonExistentMessageHash = createHash("sha256")
      .update(nonExistentMessage)
      .digest("hex");

    await expect(
      publishDelegateStatementDraft({
        address: mockAddress,
        messageOrMessageHash: {
          type: "MESSAGE",
          value: nonExistentMessage,
        },
      })
    ).rejects.toThrow(
      `No draft found for the given address (${mockAddress.toLowerCase()}), DAO (${slug}), and message hash (${nonExistentMessageHash}).`
    );
  });

  it("Gracefully handles a non-existent message hash", async () => {
    // Call utility function with a message that doesn't exist - non-hashed
    const nonExistentMessage = "Non-existent message";
    const nonExistentMessageHash = createHash("sha256")
      .update(nonExistentMessage)
      .digest("hex");

    await expect(
      publishDelegateStatementDraft({
        address: mockAddress,
        messageOrMessageHash: {
          type: "MESSAGE_HASH",
          value: nonExistentMessageHash,
        },
      })
    ).rejects.toThrow(
      `No draft found for the given address (${mockAddress.toLowerCase()}), DAO (${slug}), and message hash (${nonExistentMessageHash}).`
    );
  });

  it("Gracefully handles a non-existent Address", async () => {
    // Call utility function with an address that doesn't exist
    const fakeAddress = "0x0000000000000000000000000000000000000000";

    await expect(
      publishDelegateStatementDraft({
        address: fakeAddress,
        messageOrMessageHash: {
          type: "MESSAGE_HASH",
          value: messageHash,
        },
      })
    ).rejects.toThrow(
      `No draft found for the given address (${fakeAddress.toLowerCase()}), DAO (${slug}), and message hash (${messageHash}).`
    );
  });

  it("Should throw the appropriate error if the connection to the database fails", async () => {
    // Mock the prisma db connection so that it fails to connect
    const mockPrismaError = {
      code: "P1001",
      message: "The database server was unable to be reached.",
      clientVersion: "5.2.0", // Example client version
    };

    vi.spyOn(
      prismaWeb2Client.delegateStatements,
      "update"
    ).mockRejectedValueOnce(mockPrismaError);

    await expect(
      publishDelegateStatementDraft({
        address: mockAddress,
        messageOrMessageHash: {
          type: "MESSAGE_HASH",
          value: messageHash,
        },
      })
    ).rejects.toThrow("Failed to connect to database");
  });
});
