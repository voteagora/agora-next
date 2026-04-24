export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (process.env.E2E_BYPASS_SIWE !== "true") {
    return NextResponse.json(
      { message: "E2E bypass is disabled" },
      { status: 403 }
    );
  }

  const { generateJwt, getExpiry } = await import("@/app/lib/auth/serverAuth");

  try {
    const { address } = await request.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { message: "Missing required field: address" },
        { status: 400 }
      );
    }

    const scope = ["reader:public"];
    const ttl = await getExpiry();
    const jwt = await generateJwt(address, scope, ttl);

    const responseBody = {
      access_token: jwt,
      token_type: "JWT",
      expires_in: ttl,
    };
    return NextResponse.json(responseBody);
  } catch (e) {
    console.error("E2E token generation error:", e);
    return new Response("Internal server error", { status: 500 });
  }
}
