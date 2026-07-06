export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { validateBearerToken } from "@/app/lib/auth/edgeAuth";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";
import Tenant from "@/lib/tenant/tenant";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const PRIVY_API_URL = "https://auth.privy.io/api/v1";

async function deletePrivyUser(privyAccessToken: string) {
  const { ui } = Tenant.current();
  const appId = (ui.toggle("privy-login")?.config as UIPrivyConfig | undefined)
    ?.appId;
  const appSecret = process.env.PRIVY_APP_SECRET_CIVIC;
  if (!appId || !appSecret) {
    throw new Error("Privy server credentials not configured");
  }

  // The access token only proves the caller owns the Privy account being
  // deleted — its subject (DID) is the account we delete, nothing else.
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

  const response = await fetch(
    `${PRIVY_API_URL}/users/${encodeURIComponent(payload.sub)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`,
        "privy-app-id": appId,
      },
    }
  );
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

  if (privyAccessToken) {
    try {
      await deletePrivyUser(privyAccessToken);
    } catch (error) {
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

  try {
    await notificationCenterClient.deleteChannel(address, "email");
  } catch (error) {
    console.error("Failed to delete notification email channel", error);
  }

  return NextResponse.json({ success: true });
}

export const DELETE = withApiRouteMonitoring("api.account.delete", del);
