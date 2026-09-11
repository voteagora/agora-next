import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";
import { isAddress } from "viem";

import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";

const PRIVY_API_URL = "https://auth.privy.io/api/v1";
const DEBUG_PREFIX = "[privy-debug][server][membership]";

function debugLog(event: string, data?: Record<string, unknown>) {
  console.log(
    DEBUG_PREFIX,
    JSON.stringify({ t: new Date().toISOString(), event, ...data })
  );
}

const jwksByAppId = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export interface PrivyLinkedAccount {
  type?: string;
  address?: string;
}

export type CivicMembershipVerification =
  | {
      success: true;
      authenticated: true;
      isMember: true;
      address: `0x${string}`;
      privyUserId: string;
    }
  | {
      success: false;
      authenticated: boolean;
      isMember: false;
      code: "UNAUTHENTICATED" | "NOT_MEMBER" | "VERIFICATION_FAILED";
      error: string;
    };

export async function findCivicMembershipWallet(
  linkedAccounts: PrivyLinkedAccount[],
  readBalance: (address: `0x${string}`) => Promise<bigint>
): Promise<`0x${string}` | null> {
  const seen = new Set<string>();
  const wallets = linkedAccounts
    .filter(
      (account): account is PrivyLinkedAccount & { address: string } =>
        account.type === "wallet" &&
        typeof account.address === "string" &&
        isAddress(account.address)
    )
    .map((account) => account.address.toLowerCase() as `0x${string}`)
    .filter((address) => {
      if (seen.has(address)) return false;
      seen.add(address);
      return true;
    });

  // Promise.all is intentional: any RPC failure rejects the whole check. A
  // partial result must never be treated as proof that a user is not a member.
  const balances = await Promise.all(
    wallets.map(async (address) => ({
      address,
      balance: await readBalance(address),
    }))
  );
  return balances.find(({ balance }) => balance > 0n)?.address ?? null;
}

export async function verifyCivicPrivyMembership(
  privyAccessToken?: string,
  preferredAddress?: string
): Promise<CivicMembershipVerification> {
  const started = Date.now();
  debugLog("verify.start", {
    tokenPresent: !!privyAccessToken,
    tokenLength: privyAccessToken?.length ?? 0,
    preferredAddress,
  });
  if (!privyAccessToken) {
    debugLog("verify.result", { code: "UNAUTHENTICATED", reason: "no_token" });
    return {
      success: false,
      authenticated: false,
      isMember: false,
      code: "UNAUTHENTICATED",
      error: "Sign in to respond",
    };
  }

  const tenant = Tenant.current();
  if (tenant.slug !== "CIVIC") {
    debugLog("verify.result", {
      code: "VERIFICATION_FAILED",
      reason: "wrong_tenant",
      slug: tenant.slug,
    });
    return {
      success: false,
      authenticated: false,
      isMember: false,
      code: "VERIFICATION_FAILED",
      error: "We couldn’t check your Supporter Pass. Please try again.",
    };
  }

  const appId = (
    tenant.ui.toggle("privy-login")?.config as UIPrivyConfig | undefined
  )?.appId;
  const appSecret = process.env.PRIVY_APP_SECRET_CIVIC;
  debugLog("verify.config", {
    appIdPrefix: appId?.slice(0, 8),
    appIdPresent: !!appId,
    appSecretPresent: !!appSecret,
  });
  if (!appId || !appSecret) {
    debugLog("verify.result", {
      code: "VERIFICATION_FAILED",
      reason: "missing_server_credentials",
    });
    return {
      success: false,
      authenticated: false,
      isMember: false,
      code: "VERIFICATION_FAILED",
      error: "We couldn’t check your Supporter Pass. Please try again.",
    };
  }

  let privyUserId: string;
  try {
    let jwks = jwksByAppId.get(appId);
    if (!jwks) {
      jwks = createRemoteJWKSet(
        new URL(`${PRIVY_API_URL}/apps/${appId}/jwks.json`)
      );
      jwksByAppId.set(appId, jwks);
    }
    const { payload } = await jwtVerify(privyAccessToken, jwks, {
      issuer: "privy.io",
      audience: appId,
    });
    if (!payload.sub) throw new Error("Privy token missing subject");
    privyUserId = payload.sub;
    debugLog("verify.jwt_ok", {
      sub: payload.sub,
      iat: payload.iat,
      exp: payload.exp,
      sid: (payload as { sid?: string }).sid,
      ms: Date.now() - started,
    });
  } catch (error) {
    debugLog("verify.jwt_failed", {
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    });
    console.warn("CIVIC Privy token verification failed", error);
    return {
      success: false,
      authenticated: false,
      isMember: false,
      code: "UNAUTHENTICATED",
      error: "Your session expired. Please sign in again.",
    };
  }

  let linkedAccounts: PrivyLinkedAccount[];
  try {
    const response = await fetch(
      `${PRIVY_API_URL}/users/${encodeURIComponent(privyUserId)}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`,
          "privy-app-id": appId,
        },
      }
    );
    debugLog("verify.user_lookup_response", {
      status: response.status,
      ms: Date.now() - started,
    });
    if (!response.ok) {
      throw new Error(
        `Privy user lookup failed with status ${response.status}`
      );
    }
    const user = (await response.json()) as {
      linked_accounts?: PrivyLinkedAccount[];
    };
    linkedAccounts = user.linked_accounts ?? [];
    debugLog("verify.linked_accounts", {
      count: linkedAccounts.length,
      accounts: linkedAccounts.map((account) => ({
        type: account.type,
        address: account.address,
        walletClientType: (account as Record<string, unknown>)
          .wallet_client_type,
        connectorType: (account as Record<string, unknown>).connector_type,
        chainType: (account as Record<string, unknown>).chain_type,
      })),
    });
  } catch (error) {
    debugLog("verify.user_lookup_failed", {
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    });
    console.error("CIVIC Privy user lookup failed", error);
    return {
      success: false,
      authenticated: true,
      isMember: false,
      code: "VERIFICATION_FAILED",
      error: "We couldn’t check your Supporter Pass. Please try again.",
    };
  }

  try {
    const client = getPublicClient(tenant.contracts.token.chain);
    const normalizedPreferred =
      preferredAddress && isAddress(preferredAddress)
        ? preferredAddress.toLowerCase()
        : null;
    const orderedAccounts = normalizedPreferred
      ? [...linkedAccounts].sort((left, right) => {
          const leftPreferred =
            left.address?.toLowerCase() === normalizedPreferred ? 1 : 0;
          const rightPreferred =
            right.address?.toLowerCase() === normalizedPreferred ? 1 : 0;
          return rightPreferred - leftPreferred;
        })
      : linkedAccounts;
    const memberAddress = await findCivicMembershipWallet(
      orderedAccounts,
      async (address) => {
        const balance = await client.readContract({
          abi: tenant.contracts.token.abi,
          address: tenant.contracts.token.address as `0x${string}`,
          functionName: "balanceOf",
          args: [address],
        });
        debugLog("verify.balance", {
          address,
          balance: String(balance),
          token: tenant.contracts.token.address,
        });
        return BigInt(balance as bigint);
      }
    );
    debugLog("verify.result", {
      code: memberAddress ? "MEMBER" : "NOT_MEMBER",
      memberAddress,
      privyUserId,
      ms: Date.now() - started,
    });

    if (!memberAddress) {
      return {
        success: false,
        authenticated: true,
        isMember: false,
        code: "NOT_MEMBER",
        error: "Claim a free Supporter Pass to respond",
      };
    }

    return {
      success: true,
      authenticated: true,
      isMember: true,
      address: memberAddress,
      privyUserId,
    };
  } catch (error) {
    debugLog("verify.balance_check_failed", {
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    });
    console.error("CIVIC Supporter Pass ownership check failed", error);
    return {
      success: false,
      authenticated: true,
      isMember: false,
      code: "VERIFICATION_FAILED",
      error: "We couldn’t check your Supporter Pass. Please try again.",
    };
  }
}
