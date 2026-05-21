import { validateBearerToken } from "@/lib/auth/edgeAuth";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export type WalletJwtAuthResult =
  | { ok: true; address: string }
  | { ok: false; response: Response };

export async function requireWalletJwtAuth(
  request: Request
): Promise<WalletJwtAuthResult> {
  const auth = await validateBearerToken(request);
  if (!auth.authenticated || auth.type !== "jwt" || !auth.userId) {
    return {
      ok: false,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!ETH_ADDRESS_REGEX.test(auth.userId)) {
    return {
      ok: false,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, address: auth.userId.toLowerCase() };
}
