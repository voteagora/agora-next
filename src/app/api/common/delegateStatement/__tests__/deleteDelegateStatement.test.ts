import { describe, it, vi, expect } from "vitest";
import { stageStatus } from "@/app/lib/sharedEnums";
import { setDefaultValues } from "@/app/api/common/delegateStatement/__tests__/sharedTestInfra";
import { createHash } from "crypto";
import verifyMessage from "@/lib/serverVerifyMessage";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import { deleteDelegateStatement } from "@/app/api/common/delegateStatement/deleteDelegateStatement";
import {
  getDelegateStatementForAddress,
  getDelegateStatementsForAddress,
} from "@/app/api/common/delegateStatement/getDelegateStatement";

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

describe("deleteDelegateStatement", () => {
  it("should delete a specified delegate statement given it's primary key attributes", async () => {
    let args = {
      address: mockAddress,
      delegateStatement: mockDelegateStatementFV,
      signature: "0xsomesignaturemock" as `0x${string}`,
      message: mockMessage,
      stage: mockStage,
    };

    const messageHash = createHash("sha256").update(args.message).digest("hex");

    const mockVerifyMessage = vi.mocked(verifyMessage);
    mockVerifyMessage.mockResolvedValueOnce(true);

    // Create a delegate statement
    await createDelegateStatement(args);

    // Check the value is found
    const createRes = await getDelegateStatementForAddress({
      address: args.address,
      messageOrMessageHash: { type: "MESSAGE_HASH", value: messageHash },
    });

    expect(createRes).exist;

    // Delete the statement
    await deleteDelegateStatement({
      address: args.address,
      messageHash: messageHash,
    });

    // Check the value is not found

    const deleteRes = await getDelegateStatementForAddress({
      address: args.address,
      messageOrMessageHash: { type: "MESSAGE_HASH", value: messageHash },
    });

    expect(deleteRes).not.exist;
  });
});
