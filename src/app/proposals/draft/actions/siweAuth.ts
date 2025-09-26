"use server";

import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function verifyJwtAndGetAddress(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const address = payload.address as string;
    if (!address || typeof address !== "string") {
      return null;
    }
    return address.toLowerCase();
  } catch (e) {
    return null;
  }
}

export async function requireSiweAuth(
  message: string,
  signature: string
): Promise<{ address: string; jwt: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AGORA_API_URL || ""}/api/v1/auth/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SIWE verification failed: ${errorText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("No access token received from SIWE verification");
  }

  const address = await verifyJwtAndGetAddress(data.access_token);
  if (!address) {
    throw new Error("Invalid JWT token received");
  }

  return {
    address,
    jwt: data.access_token,
  };
}
