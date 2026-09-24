import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDelegateStatement } from "./createDelegateStatement";
import { DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER } from "@/lib/delegateStatement/persistence";

const { findFirstMock, toggleMock, upsertMock, verifyJwtAndGetAddressMock } =
  vi.hoisted(() => ({
    findFirstMock: vi.fn(),
    toggleMock: vi.fn(),
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
};

vi.mock("@/app/lib/prisma", () => ({
  prismaWeb2Client: {
    delegateStatements: {
      findFirst: findFirstMock,
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
      ui: {
        toggle: toggleMock,
      },
    }),
  },
}));

describe("createDelegateStatement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirstMock.mockResolvedValue({
      username: "delegate-name",
      avatar: "ipfs://delegate-avatar",
    });
    toggleMock.mockReturnValue({ enabled: false });
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
          username: "delegate-name",
          avatar: "ipfs://delegate-avatar",
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

    const createData = upsertMock.mock.calls[0][0].create;
    const createPayload = createData.payload;
    expect(createData).not.toHaveProperty("email");
    expect(createData).not.toHaveProperty("notification_preferences");
    expect(createPayload).not.toHaveProperty("email");
    expect(createPayload).not.toHaveProperty("notificationPreferences");
  });

  it("stores managed profile metadata when the tenant toggle is enabled", async () => {
    verifyJwtAndGetAddressMock.mockResolvedValue(address);
    toggleMock.mockReturnValue({ enabled: true });

    await createDelegateStatement({
      address,
      delegateStatement: {
        ...delegateStatement,
        username: " Civic Alice ",
        avatar: " ipfs://civic-avatar ",
      },
      auth: {
        kind: "siwe_jwt",
        jwt: "jwt-token",
      },
    });

    const createData = upsertMock.mock.calls[0][0].create;
    const createPayload = createData.payload;

    expect(createData.username).toBe("Civic Alice");
    expect(createData.avatar).toBe("ipfs://civic-avatar");
    expect(createPayload).not.toHaveProperty("username");
    expect(createPayload).not.toHaveProperty("avatar");
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
