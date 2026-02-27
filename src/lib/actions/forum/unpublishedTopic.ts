"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "forum_unpublished_access";

export async function hasUnpublishedTopicAccess(): Promise<boolean> {
  if (!process.env.FORUM_UNPUBLISHED_TOPIC_PASSWORD) return true;
  return !!(await cookies()).get(COOKIE_NAME);
}

export async function verifyUnpublishedTopicPassword(
  password: string,
  redirectPath: string
): Promise<{ error?: string }> {
  const expected = process.env.FORUM_UNPUBLISHED_TOPIC_PASSWORD;
  if (password !== expected) {
    return { error: "Invalid password" };
  }
  (await cookies()).set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  redirect(redirectPath);
}
