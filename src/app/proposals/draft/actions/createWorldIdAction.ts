"use server";

import { encodePacked, decodeEventLog } from "viem";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";

export async function createWorldIdAction(txHash: `0x${string}`) {
  const app_id = process.env.WORLD_ID_APP_ID;
  const devPortalApiKey = process.env.DEV_PORTAL_API_KEY;

  if (!app_id || !devPortalApiKey) {
    throw new Error("Missing World ID configuration");
  }

  const tenant = Tenant.current();
  const publicClient = getPublicClient();

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

  const proposalCreatedEventAbi = {
    type: "event",
    name: "ProposalCreated",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "proposer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "targets",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "values",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "signatures",
        type: "string[]",
        indexed: false,
        internalType: "string[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        indexed: false,
        internalType: "bytes[]",
      },
      {
        name: "voteStart",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "voteEnd",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "description",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
  } as const;

  let proposalId: bigint | undefined;

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() ===
      tenant.contracts.governor.address.toLowerCase()
    ) {
      try {
        const decoded = decodeEventLog({
          abi: [proposalCreatedEventAbi],
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "ProposalCreated") {
          proposalId = decoded.args.proposalId;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!proposalId) {
    throw new Error("ProposalCreated event not found in transaction logs");
  }

  const action = encodePacked(["uint256"], [proposalId]);

  const devPortalResponse = await fetch(
    `https://developer.worldcoin.org/api/v2/create-action/${app_id}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${devPortalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        name: action,
        max_verifications: 1,
      }),
    }
  );

  if (!devPortalResponse.ok) {
    throw new Error(
      `Failed to create World ID action: ${devPortalResponse.statusText}`
    );
  }

  return {
    proposalId: proposalId.toString(),
    worldIdAction: await devPortalResponse.json(),
  };
}
