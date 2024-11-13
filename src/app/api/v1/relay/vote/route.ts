import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { z } from "zod";
import { voteBySignatureApi } from "./castVote";

const voteRequestSchema = z.object({
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  proposalId: z.string(),
  support: z.number(),
});

export async function POST(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("body", body);
    const parsedBody = voteRequestSchema.parse(body);

    const voteTxHash = await voteBySignatureApi({
      signature: parsedBody.signature as `0x${string}`,
      proposalId: parsedBody.proposalId,
      support: parsedBody.support,
    });
    return NextResponse.json(voteTxHash);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
