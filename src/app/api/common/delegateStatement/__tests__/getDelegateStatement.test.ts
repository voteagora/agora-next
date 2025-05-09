import { describe, it, expect, beforeEach, afterEach } from "vitest"; // Import from vitest
import { stageStatus } from "@/app/lib/sharedEnums";
import { setDefaultValues } from "@/app/api/common/delegateStatement/__tests__/sharedTestInfra";
import { vi } from "vitest";
import verifyMessage from "@/lib/serverVerifyMessage";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import { createHash } from "crypto";
import { getDelegateStatementsForAddress } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
const { slug } = Tenant.current();

vi.mock("server-only", () => ({})); // Mock server-only module

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

describe("getDelegteStatement", () => {
  let messageHash1: string;
  let messageHash2: string;

  let args: any;

  beforeEach(async () => {
    args = {
      address: mockAddress,
      delegateStatement: mockDelegateStatementFV,
      signature: "0xsomesignaturemock" as `0x${string}`,
      message: mockMessage,
      stage: mockStage,
    };
    messageHash1 = createHash("sha256").update(args.message).digest("hex");

    const mockVerifyMessage = vi.mocked(verifyMessage);
    mockVerifyMessage.mockResolvedValueOnce(true);
    mockVerifyMessage.mockResolvedValueOnce(true); // for second create

    // Create a delegate statement
    await createDelegateStatement(args);
    // Create a second delegate statement
    args.message = "second-message";
    await createDelegateStatement(args);

    messageHash2 = createHash("sha256").update(args.message).digest("hex");
  });

  afterEach(async () => {
    // Delete the delegate statements to clean up
    await prismaWeb2Client.delegateStatements.delete({
      where: {
        address_dao_slug_stage_message_hash: {
          address: args.address.toLowerCase(),
          dao_slug: slug,
          stage: args.stage,
          message_hash: messageHash1,
        },
      },
    });
    await prismaWeb2Client.delegateStatements.delete({
      where: {
        address_dao_slug_stage_message_hash: {
          address: args.address.toLowerCase(),
          dao_slug: slug,
          stage: args.stage,
          message_hash: messageHash2,
        },
      },
    });
  });

  it("should return all delegate statements ", async () => {
    // Get the statements
    const delegateStatements = await getDelegateStatementsForAddress({
      address: mockAddress,
      stage: mockStage,
    });

    // Verify they are as expected, check message hashes
    const expectedHashes = [messageHash1, messageHash2];

    const statementHashes = delegateStatements!!.map(
      (statement) => statement.message_hash
    );
    expect(statementHashes).toEqual(expectedHashes);
  });

  it("should return a ");
});
