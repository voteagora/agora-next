#!/usr/bin/env tsx

import { config as loadEnv } from "dotenv";
loadEnv();

import { DaoSlug, Prisma } from "@prisma/client";
import { prismaWeb2Client } from "@/app/lib/prisma";

type PreferenceState = "on" | "off";

const NAMESPACE_TO_DAO_SLUG: Record<string, DaoSlug> = {
  optimism: "OP",
  ens: "ENS",
  etherfi: "ETHERFI",
  uniswap: "UNI",
  cyber: "CYBER",
  scroll: "SCROLL",
  derive: "DERIVE",
  pguild: "PGUILD",
  boost: "BOOST",
  xai: "XAI",
  b3: "B3",
  demo: "DEMO",
  linea: "LINEA",
  towns: "TOWNS" as DaoSlug,
  syndicate: "SYNDICATE" as DaoSlug,
  demo2: "DEMO2" as DaoSlug,
  demo3: "DEMO3" as DaoSlug,
  demo4: "DEMO4" as DaoSlug,
};

function getSlug(): DaoSlug {
  const namespace = process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME;
  if (!namespace) {
    throw new Error(
      "NEXT_PUBLIC_AGORA_INSTANCE_NAME environment variable is required"
    );
  }
  const slug = NAMESPACE_TO_DAO_SLUG[namespace];
  if (!slug) {
    throw new Error(`Unknown namespace: ${namespace}`);
  }
  return slug;
}

function getClientConfig() {
  const baseUrl = process.env.NOTIFICATION_CENTER_URL;
  const apiKey = process.env.NOTIFICATION_CENTER_API_KEY;
  if (!baseUrl) throw new Error("NOTIFICATION_CENTER_URL is missing from env");
  if (!apiKey)
    throw new Error("NOTIFICATION_CENTER_API_KEY is missing from env");
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function apiRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  allowNotFound = false
): Promise<T | null> {
  const { baseUrl, apiKey } = getClientConfig();
  const url = `${baseUrl}/v1${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (allowNotFound && response.status === 404) return null;
    const text = await response.text().catch(() => "");
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) return null;
  return response.json() as Promise<T>;
}

const notificationCenterClient = {
  async getRecipient(recipientId: string) {
    return apiRequest<{ recipient_id: string }>(
      `/recipients/${recipientId}`,
      "GET",
      undefined,
      true
    );
  },
  async createRecipient(payload: {
    recipient_id: string;
    recipient_type: string;
  }) {
    return apiRequest<{ success: boolean }>("/recipients", "POST", payload);
  },
  async updateRecipient(
    recipientId: string,
    payload: { attributes: Record<string, number[]> }
  ) {
    return apiRequest<{ success: boolean }>(
      `/recipients/${recipientId}`,
      "PUT",
      payload
    );
  },
  async updateChannel(
    recipientId: string,
    channel: string,
    payload: { type: string; address: string; verified: boolean }
  ) {
    return apiRequest<{ success: boolean }>(
      `/recipients/${recipientId}/channels/${channel}`,
      "POST",
      payload
    );
  },
  async setPreference(
    recipientId: string,
    eventType: string,
    channel: string,
    state: PreferenceState
  ) {
    return apiRequest<{ success: boolean }>(
      `/preferences/${recipientId}/set`,
      "POST",
      { event_type: eventType, channel, state }
    );
  },
};

async function fetchForumEngagement(
  address: string,
  daoSlug: DaoSlug
): Promise<{ authored_topics: number[]; engaged_topics: number[] }> {
  const [authoredTopics, engagedPosts] = await Promise.all([
    prismaWeb2Client.forumTopic.findMany({
      where: {
        dao_slug: daoSlug,
        address: { equals: address, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    }),
    prismaWeb2Client.forumPost.findMany({
      where: {
        dao_slug: daoSlug,
        address: { equals: address, mode: "insensitive" },
        deletedAt: null,
      },
      select: { topicId: true },
      distinct: ["topicId"],
    }),
  ]);

  return {
    authored_topics: authoredTopics.map((t) => t.id),
    engaged_topics: engagedPosts.map((p) => p.topicId),
  };
}

type LegacyPreferences = {
  wants_proposal_created_email?: boolean | "prompt" | "prompted";
  wants_proposal_ending_soon_email?: boolean | "prompt" | "prompted";
};

const PREFERENCE_MAP: Record<keyof LegacyPreferences, string[]> = {
  wants_proposal_created_email: ["proposal_published"],
  wants_proposal_ending_soon_email: [
    "proposal_reminder_24h",
    "proposal_reminder_1h",
  ],
};

function mapLegacyPreference(value: unknown): PreferenceState | null {
  if (value === true) return "on";
  if (value === false) return "off";
  // prompt/prompted = never asked or didn't answer → skip (inherit default)
  return null;
}

function parseLegacyPreferences(value: unknown): LegacyPreferences {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as LegacyPreferences;
}

async function main() {
  const slug = getSlug();

  console.log(`Starting migration for dao_slug: ${slug}`);

  const statements = await prismaWeb2Client.delegateStatements.findMany({
    where: {
      dao_slug: slug,
      OR: [
        { email: { not: null } },
        { notification_preferences: { not: Prisma.JsonNull } },
      ],
    },
    select: {
      address: true,
      email: true,
      notification_preferences: true,
    },
  });

  console.log(`Found ${statements.length} delegate statements to process.`);

  const summary = {
    processed: 0,
    createdRecipients: 0,
    updatedEmails: 0,
    updatedPreferences: 0,
    updatedAttributes: 0,
    failures: 0,
  };

  const legacyValueCounts = {
    wants_proposal_created_email: {
      true: 0,
      false: 0,
      prompt: 0,
      prompted: 0,
      missing: 0,
    },
    wants_proposal_ending_soon_email: {
      true: 0,
      false: 0,
      prompt: 0,
      prompted: 0,
      missing: 0,
    },
  };

  for (const statement of statements) {
    summary.processed += 1;
    const recipientId = statement.address.toLowerCase();
    const email = statement.email?.trim();

    try {
      // Check if recipient already exists
      const existing = await notificationCenterClient.getRecipient(recipientId);

      if (!existing) {
        await notificationCenterClient.createRecipient({
          recipient_id: recipientId,
          recipient_type: "wallet_address",
        });
        summary.createdRecipients += 1;
      }

      if (email) {
        await notificationCenterClient.updateChannel(recipientId, "email", {
          type: "email",
          address: email,
          verified: false,
        });
        summary.updatedEmails += 1;
      }

      const engagement = await fetchForumEngagement(recipientId, slug);
      const attributes: Record<string, number[]> = {};
      if (engagement.authored_topics.length > 0) {
        attributes.authored_topics = engagement.authored_topics;
      }
      if (engagement.engaged_topics.length > 0) {
        attributes.engaged_topics = engagement.engaged_topics;
      }
      if (Object.keys(attributes).length > 0) {
        await notificationCenterClient.updateRecipient(recipientId, {
          attributes,
        });
        summary.updatedAttributes += 1;
      }

      const preferences = parseLegacyPreferences(
        statement.notification_preferences
      );

      for (const [legacyKey, eventTypes] of Object.entries(PREFERENCE_MAP)) {
        const rawValue = preferences[legacyKey as keyof LegacyPreferences];
        const counts =
          legacyValueCounts[legacyKey as keyof typeof legacyValueCounts];

        if (rawValue === true) counts.true += 1;
        else if (rawValue === false) counts.false += 1;
        else if (rawValue === "prompt") counts.prompt += 1;
        else if (rawValue === "prompted") counts.prompted += 1;
        else counts.missing += 1;

        const mapped = mapLegacyPreference(rawValue);

        if (mapped) {
          for (const eventType of eventTypes) {
            await notificationCenterClient.setPreference(
              recipientId,
              eventType,
              "email",
              mapped
            );
            summary.updatedPreferences += 1;
          }
        }
      }
    } catch (error) {
      summary.failures += 1;
      console.error(
        `Failed to migrate ${recipientId}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log("Processed:", summary.processed);
  console.log("Created recipients:", summary.createdRecipients);
  console.log("Updated emails:", summary.updatedEmails);
  console.log(
    "Updated attributes (forum engagement):",
    summary.updatedAttributes
  );
  console.log("Updated preferences:", summary.updatedPreferences);
  console.log("Failures:", summary.failures);

  console.log("\n=== Legacy Preference Values ===");
  console.log("\nwants_proposal_created_email:");
  console.log(
    "  true (opted in):",
    legacyValueCounts.wants_proposal_created_email.true
  );
  console.log(
    "  false (opted out):",
    legacyValueCounts.wants_proposal_created_email.false
  );
  console.log(
    "  prompt (never asked):",
    legacyValueCounts.wants_proposal_created_email.prompt
  );
  console.log(
    "  prompted (asked, no answer):",
    legacyValueCounts.wants_proposal_created_email.prompted
  );
  console.log(
    "  missing (no preference set):",
    legacyValueCounts.wants_proposal_created_email.missing
  );

  console.log("\nwants_proposal_ending_soon_email:");
  console.log(
    "  true (opted in):",
    legacyValueCounts.wants_proposal_ending_soon_email.true
  );
  console.log(
    "  false (opted out):",
    legacyValueCounts.wants_proposal_ending_soon_email.false
  );
  console.log(
    "  prompt (never asked):",
    legacyValueCounts.wants_proposal_ending_soon_email.prompt
  );
  console.log(
    "  prompted (asked, no answer):",
    legacyValueCounts.wants_proposal_ending_soon_email.prompted
  );
  console.log(
    "  missing (no preference set):",
    legacyValueCounts.wants_proposal_ending_soon_email.missing
  );

  console.log("\n=== Mapping Applied ===");
  console.log("true → 'on' (will receive notifications)");
  console.log("false → 'off' (will NOT receive notifications)");
  console.log("prompt/prompted/missing → skipped (inherit event type default)");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaWeb2Client.$disconnect();
  });
