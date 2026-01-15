import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";

export async function POST(request: NextRequest) {
  try {
    const { namespace } = Tenant.current();
    const hubUrl = process.env.NOTIFICATION_HUB_API_URL;
    const apiKey = process.env.NOTIFICATION_HUB_API_KEY;

    if (!hubUrl || !apiKey) {
      return NextResponse.json(
        { error: "Configuration Error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { address, subscription } = body;

    if (!address || !subscription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Upsert Recipient (Ensure user exists)
    // We use POST /recipients which handles upsert logic in the Hub
    const upsertRes = await fetch(`${hubUrl}/v1/recipients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        recipient_id: address,
        recipient_type: "wallet_address",
        attributes: {
          tenant: namespace,
        },
      }),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error("Hub Recipient Upsert Error", err);
      return NextResponse.json(
        { error: "Failed to register recipient" },
        { status: upsertRes.status }
      );
    }

    // 2. Add/Update PWA Channel
    const channelRes = await fetch(
      `${hubUrl}/v1/recipients/${address}/channels/pwa`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          type: "pwa",
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        }),
      }
    );

    if (!channelRes.ok) {
      const err = await channelRes.text();
      console.error("Hub Channel Config Error", err);
      return NextResponse.json(
        { error: "Failed to configure PWA channel" },
        { status: channelRes.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Proxy Subscription Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
