"use server";

import { encodePacked, decodeEventLog } from "viem";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";

export async function createWorldIdAction(proposalTitle: string) {
  const app_id = process.env.WORLD_ID_APP_ID;
  const devPortalApiKey = process.env.DEV_PORTAL_API_KEY;

  if (!app_id || !devPortalApiKey) {
    throw new Error("Missing World ID configuration");
  }

  const devPortalResponse = await fetch(
    `https://developer.worldcoin.org/api/v2/create-action/${app_id}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${devPortalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: proposalTitle,
        name: proposalTitle,
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
    worldIdAction: await devPortalResponse.json(),
  };
}
