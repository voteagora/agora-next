import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";

export async function GET(request: NextRequest) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    console.log(
      "VAPID Config Error. Available Env Vars:",
      Object.keys(process.env)
    );

    return NextResponse.json(
      {
        error: "VAPID Public Key not configured",
        debug_env_keys: Object.keys(process.env).filter(
          (k) => k.startsWith("NEXT_PUBLIC") || k.includes("VAPID")
        ),
        node_env: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    vapidPublicKey,
  });
}
