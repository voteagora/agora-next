import { describe, it, vi, expect, afterEach } from "vitest"; // Import from vitest
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
import { stageStatus as prismaStageStatus } from "@prisma/client";
import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
const { ui } = Tenant.current();
import { prismaWeb2Client } from "@/app/lib/prisma";
import { createHash } from "crypto";
// import { cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({})); // Mock server-only module

// vi.mock("@/app/api/common/delegateStatement/createDelegateStatement", () => ({
//   createDelegateStatement: vi.fn(),
// }));

vi.mock("@/lib/serverVerifyMessage", () => ({
  default: vi.fn(),
}));

// Add some default values that are refrenced multiple times
const mockAddress =
  "0xcC0B26236AFa80673b0859312a7eC16d2b72C1e3" as `0x${string}`;
const mockStage = stageStatus.PUBLISHED as stageStatus;
const mockSlug = "DEMO";

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
const requireCodeOfConduct = !!ui.toggle("delegates/code-of-conduct")?.enabled;
const requireDaoPrinciples = !!ui.toggle("delegates/dao-principles")?.enabled;
const topIssues = ui.governanceIssues;
const defaultIssues = !topIssues;

const setDefaultValues = (delegateStatement: DelegateStatement | null) => {
  return {
    agreeCodeConduct: !requireCodeOfConduct,
    agreeDaoPrinciples: !requireDaoPrinciples,
    daoSlug: mockSlug,
    discord: delegateStatement?.discord || "",
    delegateStatement:
      (delegateStatement?.payload as { delegateStatement?: string })
        ?.delegateStatement || "",
    email: delegateStatement?.email || "",
    twitter: delegateStatement?.twitter || "",
    warpcast: delegateStatement?.warpcast || "",
    scwAddress: delegateStatement?.scw_address || "",
    topIssues: Array.isArray(
      (
        delegateStatement?.payload as {
          topIssues: { value: string; type: string }[];
        }
      )?.topIssues
    )
      ? (
          delegateStatement?.payload as {
            topIssues: { value: string; type: string }[];
          }
        )?.topIssues
      : defaultIssues
        ? [] // Convert boolean `defaultIssues` to an empty array
        : [],

    topStakeholders:
      (
        delegateStatement?.payload as {
          topStakeholders: {
            value: string;
            type: string;
          }[];
        }
      )?.topStakeholders?.length > 0
        ? (
            delegateStatement?.payload as {
              topStakeholders: {
                value: string;
                type: string;
              }[];
            }
          )?.topStakeholders
        : [],

    openToSponsoringProposals:
      (
        delegateStatement?.payload as {
          openToSponsoringProposals?: "yes" | "no" | null;
        }
      )?.openToSponsoringProposals || null,
    mostValuableProposals: Array.isArray(
      (
        delegateStatement?.payload as {
          mostValuableProposals?: { number: string }[];
        }
      )?.mostValuableProposals
    )
      ? (
          (
            delegateStatement?.payload as {
              mostValuableProposals?: object[];
            }
          )?.mostValuableProposals as { number: string }[]
        ).filter(
          (proposal) =>
            typeof proposal === "object" &&
            "number" in proposal &&
            typeof proposal.number === "string"
        )
      : [],
    leastValuableProposals: Array.isArray(
      (
        delegateStatement?.payload as {
          leastValuableProposals?: { number: string }[];
        }
      )?.leastValuableProposals
    )
      ? (
          (
            delegateStatement?.payload as {
              leastValuableProposals?: object[];
            }
          )?.leastValuableProposals as { number: string }[]
        ).filter(
          (proposal) =>
            typeof proposal === "object" &&
            "number" in proposal &&
            typeof proposal.number === "string"
        )
      : [],
    notificationPreferences: (delegateStatement?.notification_preferences as {
      wants_proposal_created_email: "prompt" | "prompted" | boolean;
      wants_proposal_ending_soon_email: "prompt" | "prompted" | boolean;
    }) || {
      wants_proposal_created_email: "prompt",
      wants_proposal_ending_soon_email: "prompt",
    },
    last_updated: new Date().toISOString(),
  };
};

const mockDelegateStatementFV = setDefaultValues(mockDelegateStatement);

describe("createDelegateStatement basic setup", () => {
  // afterEach(() => {
  //   vi.clearAllMocks();
  //   cleanup();
  // });

  // it("should call createDelegateStatement with the correct data", async () => {
  //   const args = {
  //     address: mockAddress,
  //     delegateStatement: mockDelegateStatementFV,
  //     signature: "0xsomesignaturemock" as `0x${string}`,
  //     message: "mock-message",
  //     stage: mockStage,
  //   };

  //   // Mock `createDelegateStatement` to resolve its Promise
  //   const mockedFn = vi.mocked(createDelegateStatement);
  //   // @ts-ignore
  //   mockedFn.mockResolvedValueOnce(undefined); // Since the function resolves without a return

  //   console.log("args", args);

  //   // Call the function
  //   try {
  //     const result = await createDelegateStatement(args);
  //     console.log("result", result);
  //   } catch (error) {
  //     console.log("error", error);
  //   }

  //   // Assertions
  //   expect(mockedFn).toHaveBeenCalledTimes(1); // Validate it was called exactly once
  //   expect(mockedFn).toHaveBeenCalledWith(args); // Validate it was called with the right arguments
  // });

  it("should create a record in the database", async () => {
    const args = {
      address: mockAddress,
      delegateStatement: mockDelegateStatementFV,
      signature: "0xsomesignaturemock" as `0x${string}`,
      message: "mock-message",
      stage: mockStage,
    };
    const mockVerifyMessage = vi.mocked(verifyMessage);
    mockVerifyMessage.mockResolvedValueOnce(true);

    // call the function
    const result = await createDelegateStatement(args);

    // validate the function exists
    // const result = await prismaWeb2Client.delegateStatements.findFirst({
    //   where: {
    //     address: args.address,
    //     dao_slug: mockSlug,
    //     stage: args.stage as prismaStageStatus,
    //   },
    // }).;

    console.log("result", result);
    const messageHash = createHash("sha256").update(args.message).digest("hex");

    // Assert the record exists and matches the input data
    expect(result?.address.toLowerCase()).toBe(args.address.toLowerCase());
    expect(result?.dao_slug).toBe(mockSlug);
    expect(result?.stage).toBe(args.stage);
    expect(result?.signature).toBe(args.signature);
    expect(result?.message_hash).toBe(messageHash);
    expect(result?.payload).toEqual(args.delegateStatement);

    // clean up after ourselves
    prismaWeb2Client.delegateStatements.delete({
      where: {
        address_dao_slug_stage: {
          address: args.address,
          dao_slug: mockSlug,
          stage: args.stage,
        },
      },
    });
  });
});
