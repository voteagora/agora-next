import { type NextRequest, NextResponse } from "next/server";
import { apiFetchRelayStatus } from "./getRelayStatus";

export async function GET() {
  try {
    const status = await apiFetchRelayStatus();
    return NextResponse.json(status);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
