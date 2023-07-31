import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

// TODO
// Add fallback to Ethers if this is slow, or not responding.
async function resolveENSName(ensName) {
  const query = `
    query {
      ensProfiles(
        filters: {
          name: "${ensName}"
        }
      ) {
        addresses {
          address
          coinType
        }
        attributes {
          textKey
          textValue
        }
        contenthash
        name
        owner
      }
    }
  `;

  // TODO
  // Remove hardcode and make sure that we have a more flexible way of doing this in case we
  // get shut down
  const url = "https://query.indexing.co/graphql";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  // TODO: Build a type or model around this. Feels ugly
  const address = data.data.ensProfiles[0].addresses[0]['address'];

  return address;
}

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
      address: delegate.account,
    },
  };

  return NextResponse.json(response);
}

