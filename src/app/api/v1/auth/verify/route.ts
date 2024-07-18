import { NextResponse, type NextRequest } from "next/server";
import { SiweMessage } from "siwe";
import {
  generateJwt,
  getRolesForUser,
  getExpiry,
} from "@/app/lib/auth/serverAuth";

import verifyMessage from "@/lib/serverVerifyMessage";
import prisma from "@/app/lib/prisma";

// This should create a user id record if there is not one already
// This should not generate an API key
export async function POST(request: Request) {
  const body = await request.json();
  const { message, signature } = body;
  const siweObject = new SiweMessage(message);

  const verification = await verifyMessage({
    address: siweObject.address as `0x${string}`,
    message,
    signature,
  });

  if (!verification) {
    return NextResponse.json({ message: `Invalid signature` }, { status: 401 });
  }

  // create JWT
  const scope = await getRolesForUser(siweObject.address, siweObject);
  const ttl = await getExpiry();
  const jwt = await generateJwt(siweObject.address, scope, ttl, {
    address: siweObject.address,
    chainId: `${siweObject.chainId}`,
    nonce: siweObject.nonce,
  });

  const responseBody = {
    access_token: jwt,
    token_type: "JWT",
    expires_in: ttl,
  };
  return NextResponse.json(responseBody);
}
