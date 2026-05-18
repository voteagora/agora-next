import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "forum_unpublished_access";

export const hasUnpublishedTopicAccess = createServerFn({
  method: "GET",
}).handler(async (): Promise<boolean> => {
  if (!process.env.FORUM_UNPUBLISHED_TOPIC_PASSWORD) return true;
  return !!(await getCookie(COOKIE_NAME));
});

const _verifyFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; redirectPath: string }) => data)
  .handler(async ({ data }): Promise<{ error: string } | never> => {
    const expected = process.env.FORUM_UNPUBLISHED_TOPIC_PASSWORD;
    if (data.password !== expected) {
      return { error: "Invalid password" };
    }
    setCookie(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    throw redirect({ href: data.redirectPath });
  });

export function verifyUnpublishedTopicPassword(
  password: string,
  redirectPath: string
): Promise<{ error?: string }> {
  return _verifyFn({ data: { password, redirectPath } }) as any;
}
