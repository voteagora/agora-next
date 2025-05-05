import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Extract the Sentry DSN from your environment or config
  const sentryDsn =
    "https://0dfeb56c16562e37267f25b351d6b0b4@o4504161740718080.ingest.us.sentry.io/4509164749193216";

  // Parse the DSN to get the endpoint and auth token
  const dsnMatch = sentryDsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
  if (!dsnMatch) {
    return NextResponse.json({ error: "Invalid DSN format" }, { status: 400 });
  }

  const [, publicKey, host, projectId] = dsnMatch;

  try {
    // Clone the request to create a new one we can modify
    const clonedReq = req.clone();

    // Get the content type
    const contentType = req.headers.get("Content-Type") || "";
    console.log("### Content-Type:", contentType);

    // Get the request body as an ArrayBuffer to preserve binary data
    const arrayBuffer = await req.arrayBuffer();
    const bodyText = new TextDecoder().decode(arrayBuffer);

    console.log("### Received body (raw):", bodyText);
    console.log("### Body length:", bodyText.length);
    console.log("### Body type:", typeof bodyText);

    // Try to parse as JSON for better logging
    try {
      const jsonBody = JSON.parse(bodyText);
      console.log(
        "### Body as JSON:",
        JSON.stringify(jsonBody, null, 2).substring(0, 500)
      );
    } catch (e) {
      console.log("### Not valid JSON");
    }

    // Determine if this is an envelope format (contains newlines)
    const isEnvelope = bodyText.includes("\n");
    console.log("### Is envelope format:", isEnvelope);

    // Use the appropriate endpoint based on the data format
    const sentryUrl = isEnvelope
      ? `https://${host}/api/${projectId}/envelope/`
      : `https://${host}/api/${projectId}/store/`;

    console.log("### Using Sentry endpoint:", sentryUrl);
    console.log("### forward request to sentry");

    // Forward the request to Sentry with auth header
    const sentryResponse = await fetch(sentryUrl, {
      method: "POST",
      headers: {
        // Preserve the original content type if possible
        "Content-Type": isEnvelope
          ? "application/x-sentry-envelope"
          : contentType,
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=tunnel, sentry_key=${publicKey}`,
      },
      // Send the raw body data
      body: arrayBuffer,
    });

    console.log(
      "### DONE forwarding request to sentry, status:",
      sentryResponse.status
    );

    // Return Sentry's response
    const data = await sentryResponse.text();
    console.log("### Sentry response:", data);

    return new NextResponse(data, {
      status: sentryResponse.status,
      headers: {
        "Content-Type":
          sentryResponse.headers.get("Content-Type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("Failed to proxy to Sentry:", error);
    return NextResponse.json(
      { error: "Failed to proxy to Sentry" },
      { status: 500 }
    );
  }
}
