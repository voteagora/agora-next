import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { SiweMessage } = await import("siwe");
  const { default: verifyMessage } = await import("@/lib/serverVerifyMessage");
  const { generateJwt, getRolesForUser, getExpiry } = await import(
    "@/app/lib/auth/serverAuth"
  );

  try {
    const { message, signature } = await request.json();
    const siweObject = new SiweMessage(message);

    const verification = await verifyMessage({
      address: siweObject.address as `0x${string}`,
      message,
      signature,
    });

    if (!verification) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
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
  } catch (e) {
    console.error(e);
    return new Response("Internal server error", { status: 500 });
  }
}
