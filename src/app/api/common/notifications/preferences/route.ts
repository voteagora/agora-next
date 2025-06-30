import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const authResponse = await authenticateApiUser(request);

    if (!authResponse.authenticated) {
      return new Response(authResponse.failReason, { status: 401 });
    }

    const body = await request.json();
    const {
      address,
      notificationPreferences,
    }: {
      address: `0x${string}`;
      notificationPreferences: boolean;
    } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { slug } = Tenant.current();

    const updated = await prismaWeb2Client.delegateStatements.upsert({
      where: {
        address_dao_slug_message_hash: {
          address: address.toLowerCase(),
          dao_slug: slug,
          message_hash: "Not Hashed",
        },
      },
      create: {
        address: address.toLowerCase(),
        dao_slug: slug,
        message_hash: "",
        notification_preferences: {
          wants_proposal_created_email: notificationPreferences,
          wants_proposal_ending_soon_email: notificationPreferences,
          last_updated: new Date().toISOString(),
        },
        signature: "",
        payload: {},
      },
      update: {
        notification_preferences: {
          wants_proposal_created_email: notificationPreferences,
          wants_proposal_ending_soon_email: notificationPreferences,
          last_updated: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.notification_preferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
