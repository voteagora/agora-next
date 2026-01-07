import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";

export async function GET(request: NextRequest) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  if (!vapidPublicKey) {
    return NextResponse.json({ error: "VAPID Public Key not configured" }, { status: 500 });
  }

  return NextResponse.json({
    vapidPublicKey,
  });
}
