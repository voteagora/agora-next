import { headers } from "next/headers";

/**
 * Get the base URL for the current request
 * Used for metadataBase in Next.js metadata generation
 */
export function getMetadataBaseUrl(): URL {
  const headerList = headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host") || "localhost:3000";
  const protoHeader = headerList.get("x-forwarded-proto");
  const protocol =
    protoHeader || (host && host.startsWith("localhost") ? "http" : "https");

  return new URL(`${protocol}://${host}`);
}
