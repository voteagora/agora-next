import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";

const bodySchema = z.object({
  email: z.string().email(),
});

function getAuthenticatedWalletAddress(
  auth: Awaited<ReturnType<typeof validateBearerToken>>
) {
  if (!auth.authenticated || auth.type !== "jwt" || !auth.userId) {
    return null;
  }
  if (!auth.userId.startsWith("0x")) {
    return null;
  }
  return auth.userId.toLowerCase();
}

export async function POST(request: NextRequest) {
  const auth = await validateBearerToken(request);
  const walletAddress = getAuthenticatedWalletAddress(auth);
  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    await ensureNotificationRecipient(walletAddress);
    await notificationCenterClient.updateChannel(walletAddress, "email", {
      type: "email",
      address: parsed.data.email,
      verified: false,
    });
    const response =
      await notificationCenterClient.initiateEmailVerification(walletAddress);

    return NextResponse.json({
      sent: true,
      message: response?.message || "Verification email sent",
    });
  } catch (error) {
    console.error("Failed to initiate submission email verification", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = await validateBearerToken(request);
  const walletAddress = getAuthenticatedWalletAddress(auth);
  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    const recipient =
      await notificationCenterClient.getRecipient(walletAddress);
    const emailChannel = recipient?.channels?.email;

    const isVerified = Boolean(
      emailChannel &&
        emailChannel.type === "email" &&
        emailChannel.address.toLowerCase() === parsed.data.toLowerCase() &&
        emailChannel.verified
    );

    return NextResponse.json({
      verified: isVerified,
      email: parsed.data,
    });
  } catch (error) {
    console.error("Failed to check submission email verification", error);
    return NextResponse.json(
      { error: "Failed to verify email status" },
      { status: 500 }
    );
  }
}
