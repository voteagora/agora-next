import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: Request) {
  const responseBody = {
    access_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    token_type: "JWT",
    expires_in: 9999999999,
  };
  return NextResponse.json(responseBody);
}
