import { NextResponse, type NextRequest } from "next/server";
import { SiweMessage } from "siwe";
import {
  generateJwt,
  getScopeForUser,
  getExpiry,
} from "@/app/lib/auth/serverAuth";

// This should create a user id record if there is not one already
// This should not generate an API key
export async function POST(request: Request) {
  const body = await request.json();
  const { message, signature, nonce } = body;

  // N.B. the below assumes the address we're validating is an
  // EOA. For EIP-1271, a provider will be necessary
  const siweObject = new SiweMessage(message);
  const verification = await siweObject.verify({
    signature: signature,
    nonce: nonce,
  });

  if (!verification.success) {
    return NextResponse.json(
      { message: `Invalid signature ${verification.error}` },
      { status: 401 }
    );
  }

  // create or update user record
  let user = await prisma.api_user.findFirst({
    where: {
      address: verification.data.address,
    },
  });

  if (!user) {
    // TODO: extract into /common/users
    user = await prisma.api_user.create({
      data: {
        address: verification.data.address,
        // TODO: chain id is probably not important, and the abstraction
        // might need to be rethought
        chain: {
          connect: {
            id: "10",
          },
        },
        enabled: true,
        description: "Created by SIWE verification",
      },
    });
  }

  // create JWT
  // TODO: resovle scope based on wallet address or user record
  // TODO: resolve ttl based on wallet address or user record
  const scope = await getScopeForUser(user.id);
  const ttl = await getExpiry();
  const jwt = await generateJwt(user.id, scope, ttl);

  const responseBody = {
    access_token: jwt,
    token_type: "JWT",
    expires_in: ttl,
  };
  return NextResponse.json(responseBody);
}
