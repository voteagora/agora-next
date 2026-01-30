import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: "VAPID Public Key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    vapidPublicKey,
  });
}
