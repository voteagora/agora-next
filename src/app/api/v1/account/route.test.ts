import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const toggleMock = vi.fn();
const validateBearerTokenMock = vi.fn();
const deleteManyMock = vi.fn();
const deleteChannelMock = vi.fn();
const burnMock = vi.fn();
const upsertDeletedAccountMock = vi.fn();

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      slug: "CIVIC",
      ui: { toggle: toggleMock },
    }),
  },
}));

vi.mock("@/app/lib/auth/edgeAuth", () => ({
  validateBearerToken: validateBearerTokenMock,
}));

vi.mock("@/app/lib/prisma", () => ({
  prismaWeb2Client: {
    delegateStatements: { deleteMany: deleteManyMock },
    deletedAccounts: { upsert: upsertDeletedAccountMock },
  },
}));

vi.mock("./burnMembershipNft", () => ({
  burnMembershipNfts: burnMock,
}));

vi.mock("@/lib/notification-center/client", () => ({
  notificationCenterClient: { deleteChannel: deleteChannelMock },
}));

vi.mock("@/lib/apiMonitoring", () => ({
  withApiRouteMonitoring: (_api: string, handler: any) => handler,
}));

const ADDRESS = "0xAbCd000000000000000000000000000000001234";

function makeRequest(body?: unknown) {
  return new NextRequest("http://localhost/api/v1/account", {
    method: "DELETE",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("DELETE /api/v1/account", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    toggleMock.mockReturnValue({ name: "delete-account", enabled: true });
    validateBearerTokenMock.mockResolvedValue({
      authenticated: true,
      type: "jwt",
      userId: ADDRESS,
    });
    deleteManyMock.mockResolvedValue({ count: 1 });
    deleteChannelMock.mockResolvedValue(undefined);
    burnMock.mockResolvedValue(undefined);
    upsertDeletedAccountMock.mockResolvedValue({});
  });

  it("returns 403 when the delete-account toggle is disabled", async () => {
    toggleMock.mockReturnValue(undefined);
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest());
    expect(response.status).toBe(403);
    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a valid SIWE JWT", async () => {
    validateBearerTokenMock.mockResolvedValue({ authenticated: false });
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest());
    expect(response.status).toBe(401);
    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it("deletes delegate statements and the email channel for the authenticated address", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest({}));
    expect(response.status).toBe(200);
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        dao_slug: "CIVIC",
        address: { equals: ADDRESS.toLowerCase(), mode: "insensitive" },
      },
    });
    expect(deleteChannelMock).toHaveBeenCalledWith(
      ADDRESS.toLowerCase(),
      "email"
    );
  });

  it("still succeeds when the notification channel deletion fails", async () => {
    deleteChannelMock.mockRejectedValue(new Error("recipient not found"));
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest({}));
    expect(response.status).toBe(200);
  });

  it("burns the membership NFT for the authenticated address", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest({}));
    expect(response.status).toBe(200);
    expect(burnMock).toHaveBeenCalledWith(ADDRESS.toLowerCase());
  });

  it("aborts deletion when the NFT burn fails", async () => {
    burnMock.mockRejectedValue(new Error("burn reverted"));
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest({}));
    expect(response.status).toBe(500);
    expect(deleteManyMock).not.toHaveBeenCalled();
    expect(upsertDeletedAccountMock).not.toHaveBeenCalled();
  });

  it("records the deleted account", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(makeRequest({}));
    expect(response.status).toBe(200);
    expect(upsertDeletedAccountMock).toHaveBeenCalledWith({
      where: {
        dao_slug_address: {
          dao_slug: "CIVIC",
          address: ADDRESS.toLowerCase(),
        },
      },
      update: {},
      create: { dao_slug: "CIVIC", address: ADDRESS.toLowerCase() },
    });
  });
});
