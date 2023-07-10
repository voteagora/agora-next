// Forbidden route if Agora API Autentication fails
import { NextResponse } from "next/server";
export async function GET(request) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
