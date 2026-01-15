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

    const response = await fetch(`${hubUrl}/v1/recipients/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        tenant: namespace,
        recipient_id: address,
        channel: "pwa",
        config: {
          type: "pwa",
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Hub Subscription Error", err);
      return NextResponse.json(
        { error: "Failed to register subscription" },
        { status: response.status }
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
