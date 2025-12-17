import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";

export async function GET(request: NextRequest) {
  try {
    const { namespace } = Tenant.current();
    const hubUrl = process.env.NOTIFICATION_HUB_API_URL;
    const apiKey = process.env.NOTIFICATION_HUB_API_KEY;

    if (!hubUrl || !apiKey) {
      console.error("Missing Notification Hub Configuration");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    // Proxy request to Hub
    // Assuming Hub has GET /v1/tenants/:tenantId/config
    const response = await fetch(`${hubUrl}/v1/tenants/${namespace}/config`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      console.error("Hub Config Error", response.status, await response.text());
      return NextResponse.json(
        { error: "Failed to fetch config" },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Return only public keys
    return NextResponse.json({
      vapidPublicKey: data.vapidPublicKey,
    });
  } catch (error) {
    console.error("Proxy Config Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
