import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const statement = await prisma.delegate_statements.findFirst({
    where: { address: params.address },
    include: {
      delegate_bios: true,
    },
  });

  // Build out statement response
  const response = {
    statement: {
      ...statement,
    },
  };

  return NextResponse.json(response);
}
