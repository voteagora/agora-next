export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { validateBearerToken } from "@/app/lib/auth/edgeAuth";
import { burnMembershipNfts } from "./burnMembershipNft";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";
import Tenant from "@/lib/tenant/tenant";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const PRIVY_API_URL = "https://auth.privy.io/api/v1";

class PrivyAccountMismatchError extends Error {}

function privyDebug(event: string, data?: Record<string, unknown>) {
  console.log(
    "[privy-debug][server][account]",
    JSON.stringify({ t: new Date().toISOString(), event, ...data })
  );
}

async function deletePrivyUser(privyAccessToken: string, siweAddress: string) {
  const { ui } = Tenant.current();
  const appId = (ui.toggle("privy-login")?.config as UIPrivyConfig | undefined)
    ?.appId;
  const appSecret = process.env.PRIVY_APP_SECRET_CIVIC;
  privyDebug("deletePrivyUser.start", {
    siweAddress,
    appIdPrefix: appId?.slice(0, 8),
    appIdPresent: !!appId,
    appSecretPresent: !!appSecret,
    tokenLength: privyAccessToken.length,
  });
  if (!appId || !appSecret) {
    throw new Error("Privy server credentials not configured");
  }

  const jwks = createRemoteJWKSet(
    new URL(`${PRIVY_API_URL}/apps/${appId}/jwks.json`)
  );
  const { payload } = await jwtVerify(privyAccessToken, jwks, {
    issuer: "privy.io",
    audience: appId,
  });
  if (!payload.sub) {
    throw new Error("Privy token missing subject");
  }
  privyDebug("deletePrivyUser.jwt_ok", {
    sub: payload.sub,
    iat: payload.iat,
    exp: payload.exp,
  });

  const authHeaders = {
    Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`,
    "privy-app-id": appId,
  };
  const userUrl = `${PRIVY_API_URL}/users/${encodeURIComponent(payload.sub)}`;

  // The token proves the caller holds this Privy session, but the endpoint's
  // contract is "delete MY account": the Privy user must be the same identity
  // as the SIWE-authenticated address, or we'd delete mismatched accounts.
  const userResponse = await fetch(userUrl, { headers: authHeaders });
  privyDebug("deletePrivyUser.user_lookup", { status: userResponse.status });
  if (userResponse.status === 404) {
    return;
  }
  if (!userResponse.ok) {
    throw new Error(
      `Privy user lookup failed with status ${userResponse.status}`
    );
  }
  const privyUser = await userResponse.json();
  const linkedAccounts: Array<{ type?: string; address?: string }> =
    privyUser?.linked_accounts ?? [];
  const ownsSiweAddress = linkedAccounts.some(
    (account) =>
      account.type === "wallet" &&
      account.address?.toLowerCase() === siweAddress
  );
  privyDebug("deletePrivyUser.linked_accounts", {
    ownsSiweAddress,
    accounts: linkedAccounts.map((account) => ({
      type: account.type,
      address: account.address,
    })),
  });
  if (!ownsSiweAddress) {
    throw new PrivyAccountMismatchError(
      "Privy user is not linked to the authenticated address"
    );
  }

  const response = await fetch(userUrl, {
    method: "DELETE",
    headers: authHeaders,
  });
  privyDebug("deletePrivyUser.delete_response", { status: response.status });
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Privy user deletion failed with status ${response.status}`
    );
  }
}

async function del(request: NextRequest) {
  const { ui, slug } = Tenant.current();
  if (!ui.toggle("delete-account")?.enabled) {
    return NextResponse.json(
      { message: "Account deletion not enabled for this tenant" },
      { status: 403 }
    );
  }

  const auth = await validateBearerToken(request);
  if (
    !auth.authenticated ||
    auth.type !== "jwt" ||
    !auth.userId ||
    !ETH_ADDRESS_REGEX.test(auth.userId)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const address = auth.userId.toLowerCase();

  let privyAccessToken: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.privyAccessToken === "string") {
      privyAccessToken = body.privyAccessToken;
    }
  } catch {
    // no body: external-wallet users have no Privy account to delete
  }
  privyDebug("delete.request", {
    address,
    privyTokenPresent: !!privyAccessToken,
  });

  // Burn first: if a later step fails, the retry finds a zero balance and
  // skips, so an account is never deleted while its NFT still exists.
  try {
    await burnMembershipNfts(address as `0x${string}`);
  } catch (error) {
    console.error("Failed to burn membership NFT", error);
    return NextResponse.json(
      { message: "Failed to burn membership NFT" },
      { status: 500 }
    );
  }

  if (privyAccessToken) {
    try {
      await deletePrivyUser(privyAccessToken, address);
    } catch (error) {
      if (error instanceof PrivyAccountMismatchError) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      console.error("Failed to delete Privy user", error);
      return NextResponse.json(
        { message: "Failed to delete Privy account" },
        { status: 502 }
      );
    }
  }

  await prismaWeb2Client.delegateStatements.deleteMany({
    where: {
      dao_slug: slug,
      address: { equals: address, mode: "insensitive" },
    },
  });

  await prismaWeb2Client.deletedAccounts.upsert({
    where: { dao_slug_address: { dao_slug: slug, address } },
    update: {},
    create: { dao_slug: slug, address },
  });

  try {
    await notificationCenterClient.deleteChannel(address, "email");
  } catch (error) {
    console.error("Failed to delete notification email channel", error);
  }

  return NextResponse.json({ success: true });
}

export const DELETE = withApiRouteMonitoring("api.account.delete", del);
