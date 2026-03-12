export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { getSafeDebugSnapshotForClient } from "@/lib/safeApi.server";

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const safeAddressParam = request.nextUrl.searchParams.get("safeAddress");
  const messageHashParam = request.nextUrl.searchParams.get("messageHash");
  const chainId = Number(chainIdParam);

  if (!Number.isFinite(chainId) || !safeAddressParam) {
    return NextResponse.json(
      { message: "Missing or invalid Safe debug parameters." },
      { status: 400 }
    );
  }

  try {
    const result = await getSafeDebugSnapshotForClient(
      chainId,
      safeAddressParam as `0x${string}`,
      messageHashParam ? (messageHashParam as `0x${string}`) : undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Safe debug data.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
