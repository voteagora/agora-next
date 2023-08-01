import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { resolveENSName } from "@/app/lib/utils";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";


export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  let address = params.addressOrENSName;

  // Check if the param is an Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    // If it's not an Ethereum address,
    // assume it's an ENS name and resolve it to an address
    address = await resolveENSName(address);
  }

  const delegate = await prisma.address_stats.findFirst({
    where: { account: address },
  });

  // Check if delegate is found
  if (!delegate) {
    return NextResponse.json(
      {
        message: "Delegate not found",
      },
      { status: 404 }
    );
  }

  // Build out delegate JSON response
  const response = {
    delegate: {
      id: delegate.id,
      address: delegate.account,
    },
  };

  return NextResponse.json(response);
}

