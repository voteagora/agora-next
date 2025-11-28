"use server";

import { z } from "zod";
import { AttachableType } from "@prisma/client";
import Tenant from "@/lib/tenant/tenant";
import verifyMessage from "@/lib/serverVerifyMessage";
import { prismaWeb2Client } from "@/app/lib/web2";
import { canPerformAction, formatVPError } from "@/lib/forumSettings";
import { checkForumPermissions } from "./admin";
import {
  fetchVotingPowerFromContract,
  formatVotingPower,
} from "@/lib/votingPowerUtils";
import { getPublicClient } from "@/lib/viem";

const addReactionSchema = z.object({
  targetType: z.literal("post"),
  targetId: z.number().min(1),
  // Store actual Unicode emoji grapheme; we'll normalize to NFC
  emoji: z.string().min(1).max(16),
  address: z.string().min(1),
  signature: z.string().min(1),
  message: z.string().min(1),
});

function normalizeEmoji(input: string): string {
  // Trim and normalize to NFC to ensure consistent Unicode storage
  const e = (input || "").trim().normalize("NFC");
  // Optionally validate it's one grapheme cluster (emoji can be multi-codepoint)
  try {
    // Prefer Intl.Segmenter if available to ensure single cluster
    // Fallback: accept as-is
    // @ts-ignore
    const seg =
      typeof Intl !== "undefined" && (Intl as any).Segmenter
        ? // @ts-ignore
          new Intl.Segmenter("en", { granularity: "grapheme" })
        : null;
    if (seg) {
      // @ts-ignore
      const it = seg.segment(e)[Symbol.iterator]();
      const first = it.next();
      const second = it.next();
      // If more than one grapheme, still allow but store as provided
      // This permits complex emojis (skin tone, ZWJ sequences)
    }
  } catch {}
  return e;
}

export async function addForumReaction(
  data: z.infer<typeof addReactionSchema>
) {
  try {
    const validated = addReactionSchema.parse(data);
    const { slug } = Tenant.current();

    const [isValid, post] = await Promise.all([
      verifyMessage({
        address: validated.address as `0x${string}`,
        message: validated.message,
        signature: validated.signature as `0x${string}`,
      }),
      prismaWeb2Client.forumPost.findUnique({
        where: { id: validated.targetId },
        include: {
          topic: {
            select: { categoryId: true },
          },
        },
      }),
    ]);

    if (!isValid) return { success: false, error: "Invalid signature" };

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Check if user is an admin (admins bypass VP requirements)
    const adminCheck = await checkForumPermissions(
      validated.address,
      post.topic.categoryId || undefined
    );

    // Only check voting power for non-admins
    if (!adminCheck.isAdmin) {
      try {
        const tenant = Tenant.current();
        const client = getPublicClient();

        // Fetch voting power directly from contract
        const votingPowerBigInt = await fetchVotingPowerFromContract(
          client,
          validated.address,
          {
            namespace: tenant.namespace,
            contracts: tenant.contracts,
          }
        );

        // Convert to number for comparison
        const currentVP = formatVotingPower(votingPowerBigInt);
        const vpCheck = await canPerformAction(currentVP, slug);

        if (!vpCheck.allowed) {
          return {
            success: false,
            error: formatVPError(vpCheck, "react to posts"),
          };
        }
      } catch (vpError) {
        console.error("Failed to check voting power:", vpError);
        // Continue if VP check fails - don't block legitimate users
      }
    }

    const emoji = normalizeEmoji(validated.emoji);

    // Upsert to be idempotent per (dao_slug,address,targetType,targetId,emoji)
    const created = await prismaWeb2Client.forumPostReaction.upsert({
      where: {
        dao_slug_address_postId_emoji: {
          dao_slug: slug,
          address: validated.address.toLowerCase(),
          postId: validated.targetId,
          emoji,
        },
      },
      update: {},
      create: {
        dao_slug: slug,
        address: validated.address.toLowerCase(),
        postId: validated.targetId,
        emoji,
      },
    });

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }
    console.error("Error adding forum reaction:", error);
    return { success: false, error: "Failed to add reaction" };
  }
}

const removeReactionSchema = z.object({
  targetType: z.literal("post"),
  targetId: z.number().min(1),
  emoji: z.string().min(1).max(16),
  address: z.string().min(1),
  signature: z.string().min(1),
  message: z.string().min(1),
});

export async function removeForumReaction(
  data: z.infer<typeof removeReactionSchema>
) {
  try {
    const validated = removeReactionSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validated.address as `0x${string}`,
      message: validated.message,
      signature: validated.signature as `0x${string}`,
    });
    if (!isValid) return { success: false, error: "Invalid signature" };

    const emoji = normalizeEmoji(validated.emoji);

    await prismaWeb2Client.forumPostReaction.delete({
      where: {
        dao_slug_address_postId_emoji: {
          dao_slug: slug,
          address: validated.address.toLowerCase(),
          postId: validated.targetId,
          emoji,
        },
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }
    // delete throws if not exist; treat as success for idempotency
    if (
      error &&
      typeof error === "object" &&
      (error as any).code === "P2025" // Record to delete does not exist
    ) {
      return { success: true };
    }
    console.error("Error removing forum reaction:", error);
    return { success: false, error: "Failed to remove reaction" };
  }
}
