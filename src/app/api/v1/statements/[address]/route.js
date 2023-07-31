import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const proposal = await prisma.delegate_statements.findFirst({
    where: { uuid: params.address },
  });

  // Build out proposal response
  const response = {
    statement: {
      // Just testing out, not meant for production
      id: proposal.id,
    },
  };

  return NextResponse.json(response);
}
