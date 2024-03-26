import { NextResponse } from "next/server";
import { headers } from "next/headers";

export function authenticateAgoraApiUser(request) {
  const headersList = headers();
  const apiKey = headersList.get("agora-api-key");

  // Use your method of checking the API user's key
  const apiUser = true;

  if (!apiUser) {
    return NextResponse.redirect(new URL("/api/forbidden", request.url));
  }

  return null;
}
