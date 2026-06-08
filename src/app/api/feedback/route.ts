export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { withApiRouteMonitoring } from "@/lib/apiMonitoring";
import Tenant from "@/lib/tenant/tenant";

const FeedbackSchema = z.object({
  type: z.enum(["bug", "feedback"]),
  summary: z.string().trim().min(3).max(160),
  details: z.string().trim().min(10).max(3000),
  pageUrl: z.string().trim().max(500).optional(),
  contact: z.string().trim().max(200).optional(),
  walletAddress: z.string().trim().max(120).optional(),
  honeypot: z.string().trim().max(200).optional(),
});

function optionalValue(value?: string) {
  return value && value.length > 0 ? value : undefined;
}

function escapeSlackText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slackText(value: string, maxLength = 3000) {
  const escaped = escapeSlackText(value);
  return escaped.length > maxLength
    ? `${escaped.slice(0, maxLength - 3)}...`
    : escaped;
}

function buildSlackPayload({
  brandName,
  contact,
  details,
  pageUrl,
  summary,
  type,
  walletAddress,
}: {
  brandName: string;
  contact?: string;
  details: string;
  pageUrl?: string;
  summary: string;
  type: "bug" | "feedback";
  walletAddress?: string;
}) {
  const typeLabel = type === "bug" ? "Bug report" : "Feedback";
  const fields = [
    `*DAO:*\n${slackText(brandName, 1900)}`,
    `*Type:*\n${typeLabel}`,
    pageUrl ? `*Page:*\n${slackText(pageUrl, 1900)}` : undefined,
    contact ? `*Contact:*\n${slackText(contact, 1900)}` : undefined,
    walletAddress
      ? `*Wallet:*\n\`${slackText(walletAddress, 1800)}\``
      : undefined,
  ].filter((field): field is string => Boolean(field));

  return {
    text: slackText(`[${brandName}] ${typeLabel}: ${summary}`, 3000),
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${brandName} ${typeLabel}`.slice(0, 150),
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${slackText(summary, 2900)}*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: slackText(details, 2900),
        },
      },
      ...(fields.length > 0
        ? [
            {
              type: "section",
              fields: fields.map((text) => ({
                type: "mrkdwn",
                text,
              })),
            },
          ]
        : []),
    ],
  };
}

async function post(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 }
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const webhookUrl = process.env.FEEDBACK_SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { message: "Feedback is not configured yet." },
      { status: 503 }
    );
  }

  const tenant = Tenant.current();
  const payload = buildSlackPayload({
    brandName: tenant.brandName,
    contact: optionalValue(parsed.data.contact),
    details: parsed.data.details,
    pageUrl: optionalValue(parsed.data.pageUrl),
    summary: parsed.data.summary,
    type: parsed.data.type,
    walletAddress: optionalValue(parsed.data.walletAddress),
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to post feedback to Slack", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { message: "Failed to submit feedback." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Failed to post feedback to Slack", error);
    return NextResponse.json(
      { message: "Failed to submit feedback." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiRouteMonitoring("api.feedback", post);
