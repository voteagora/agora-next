import { NextResponse } from "next/server";

// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

export async function GET() {
  const { generateNonce } = await import("siwe");

  try {
    const nonce = generateNonce();
    return NextResponse.json({ nonce });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
