import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { z } from "zod";
import { delegateBySignatureApi } from "./delegate";

const delegateRequestSchema = z.object({
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  delegatee: z.string().regex(/^0x[a-fA-F0-9]+$/),
  nonce: z.string(),
  expiry: z.number(),
});

export async function POST(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedBody = delegateRequestSchema.parse(body);

    const delegateTxHash = await delegateBySignatureApi({
      signature: parsedBody.signature as `0x${string}`,
      delegatee: parsedBody.delegatee as `0x${string}`,
      nonce: parsedBody.nonce,
      expiry: parsedBody.expiry,
    });
    return NextResponse.json(delegateTxHash);
  } catch (e: any) {
    console.error("Error in delegate route", e);
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
