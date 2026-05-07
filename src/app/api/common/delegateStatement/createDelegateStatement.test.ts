import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDelegateStatement } from "./createDelegateStatement";
import { DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER } from "@/lib/delegateStatement/persistence";

const { upsertMock, verifyJwtAndGetAddressMock } = vi.hoisted(() => ({
  upsertMock: vi.fn(),
  verifyJwtAndGetAddressMock: vi.fn(),
}));

const address = "0x1234567890123456789012345678901234567890" as const;

const delegateStatement = {
  agreeCodeConduct: true,
  agreeDaoPrinciples: true,
  daoSlug: "UNI",
  discord: "delegate-discord",
  delegateStatement: "Delegate statement body",
  email: "delegate@example.com",
  twitter: "delegate-twitter",
  warpcast: "delegate-warpcast",
  scwAddress: "",
  topIssues: [
    {
      type: "governance",
      value: "Fix governance",
    },
  ],
  topStakeholders: [],
  openToSponsoringProposals: null,
  mostValuableProposals: [],
  leastValuableProposals: [],
  notificationPreferences: {
    wants_proposal_created_email: "prompt" as const,
    wants_proposal_ending_soon_email: "prompt" as const,
  },
};

vi.mock("@/app/lib/prisma", () => ({
  prismaWeb2Client: {
    delegateStatements: {
      upsert: upsertMock,
    },
  },
}));

vi.mock("@/lib/siweAuth.server", () => ({
  verifyJwtAndGetAddress: verifyJwtAndGetAddressMock,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      slug: "UNI",
    }),
  },
}));

describe("createDelegateStatement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({});
  });

  it("accepts a matching SIWE JWT and stores a compatibility signature marker", async () => {
    verifyJwtAndGetAddressMock.mockResolvedValue(address);

    await createDelegateStatement({
      address,
      delegateStatement,
      auth: {
        kind: "siwe_jwt",
        jwt: "jwt-token",
      },
    });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          address: address.toLowerCase(),
          dao_slug: "UNI",
          signature: DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER,
          payload: expect.objectContaining({
            delegateStatement: "Delegate statement body",
            twitter: "delegate-twitter",
          }),
        }),
        where: {
          address_dao_slug_message_hash: expect.objectContaining({
            address: address.toLowerCase(),
            dao_slug: "UNI",
            message_hash: expect.any(String),
          }),
        },
      })
    );

    const createPayload = upsertMock.mock.calls[0][0].create.payload;
    expect(createPayload).not.toHaveProperty("email");
  });

  it("rejects SIWE JWTs that do not resolve to the submitting address", async () => {
    verifyJwtAndGetAddressMock.mockResolvedValue(null);

    await expect(
      createDelegateStatement({
        address,
        delegateStatement,
        auth: {
          kind: "siwe_jwt",
          jwt: "jwt-token",
        },
      })
    ).rejects.toThrow("Invalid token");

    expect(upsertMock).not.toHaveBeenCalled();
  });
});
