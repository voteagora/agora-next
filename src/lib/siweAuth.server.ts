import "server-only";

import { jwtVerify } from "jose";
import { SiweMessage } from "siwe";

import { AGORA_SIGN_IN_MESSAGE, SIWE_LOGIN_TTL_SECONDS } from "@/lib/constants";
import { consumeSiweNonce } from "@/lib/siweNonce.server";
import verifyMessage from "@/lib/serverVerifyMessage";

export type SiweAuthParams = {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
};

function normalizeHost(host: string) {
  return host.trim().toLowerCase();
}

function parseRequiredDate(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`Missing SIWE ${fieldName}.`);
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid SIWE ${fieldName}.`);
  }

  return parsed;
}

type VerifySiweLoginParams = {
  expectedHost: string;
  expectedAddress?: `0x${string}`;
  message: string;
  signature: `0x${string}`;
  now?: Date;
};

export async function verifySiweLogin({
  expectedHost,
  expectedAddress,
  message,
  signature,
  now = new Date(),
}: VerifySiweLoginParams) {
  try {
    const siweMessage = new SiweMessage(message);
    const normalizedExpectedHost = normalizeHost(expectedHost);
    const normalizedMessageHost = normalizeHost(siweMessage.domain);
    const messageUri = new URL(siweMessage.uri);
    const normalizedUriHost = normalizeHost(messageUri.host);

    if (expectedAddress) {
      if (siweMessage.address.toLowerCase() !== expectedAddress.toLowerCase()) {
        return {
          ok: false as const,
          reason: "SIWE address mismatch.",
        };
      }
    }

    if (siweMessage.statement !== AGORA_SIGN_IN_MESSAGE) {
      return {
        ok: false as const,
        reason: "Unexpected SIWE statement.",
      };
    }

    if (normalizedMessageHost !== normalizedExpectedHost) {
      return {
        ok: false as const,
        reason: "SIWE domain mismatch.",
      };
    }

    if (normalizedUriHost !== normalizedExpectedHost) {
      return {
        ok: false as const,
        reason: "SIWE URI host mismatch.",
      };
    }

    if (
      typeof siweMessage.chainId !== "number" ||
      !Number.isInteger(siweMessage.chainId) ||
      siweMessage.chainId <= 0
    ) {
      return {
        ok: false as const,
        reason: "Invalid SIWE chain id.",
      };
    }

    const issuedAtMs = parseRequiredDate(siweMessage.issuedAt, "issuedAt");
    const expirationTimeMs = parseRequiredDate(
      siweMessage.expirationTime,
      "expirationTime"
    );
    const notBeforeMs = siweMessage.notBefore
      ? parseRequiredDate(siweMessage.notBefore, "notBefore")
      : null;
    const nowMs = now.getTime();

    if (notBeforeMs !== null && nowMs < notBeforeMs) {
      return {
        ok: false as const,
        reason: "SIWE message is not active yet.",
      };
    }

    if (nowMs > expirationTimeMs) {
      return {
        ok: false as const,
        reason: "SIWE message expired.",
      };
    }

    if (expirationTimeMs - issuedAtMs > SIWE_LOGIN_TTL_SECONDS * 1_000) {
      return {
        ok: false as const,
        reason: "SIWE message TTL is too long.",
      };
    }

    if (!siweMessage.nonce) {
      return {
        ok: false as const,
        reason: "Missing SIWE nonce.",
      };
    }

    const isValidSignature = await verifyMessage({
      address: siweMessage.address as `0x${string}`,
      message,
      signature,
      chainId: siweMessage.chainId,
      allowSafeContractSignature: true,
    });

    if (!isValidSignature) {
      return {
        ok: false as const,
        reason: "Invalid SIWE signature.",
      };
    }

    const nonceResult = await consumeSiweNonce(siweMessage.nonce);
    if (!nonceResult.ok) {
      return {
        ok: false as const,
        reason:
          nonceResult.reason === "replayed"
            ? "SIWE nonce already used."
            : "Unknown or expired SIWE nonce.",
      };
    }

    if (nonceResult.nonce.host !== normalizedExpectedHost) {
      return {
        ok: false as const,
        reason: "SIWE nonce host mismatch.",
      };
    }

    return {
      ok: true as const,
      siweMessage,
    };
  } catch {
    return {
      ok: false as const,
      reason: "Invalid SIWE message.",
    };
  }
}

export async function verifyJwtAndGetAddress(jwt: string) {
  try {
    const verifyResult = await jwtVerify(
      jwt,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    const exp = verifyResult.payload.exp;
    if (!exp || Number(exp) < Math.floor(Date.now() / 1000)) {
      return null;
    }
    const siwe = verifyResult.payload.siwe as
      | { address: string; chainId: string }
      | undefined;
    if (!siwe?.address) return null;
    return siwe.address as `0x${string}`;
  } catch {
    return null;
  }
}
