import { generateNonce } from "siwe";

export async function GET(request: Request) {
  const nonce = generateNonce();
  const headers = new Headers();
  headers.set("Content-Type", "text/plain");
  return new Response(nonce, {
    headers,
    status: 200,
  });
}
