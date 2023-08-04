import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  // update to capture all the relevant fields from the updated form
  const proposal = await prisma.delegate_statements.create({
    data: {
      // update with all the fields from the `delegate_statements` and `delegate_bios` definitions
    },
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
