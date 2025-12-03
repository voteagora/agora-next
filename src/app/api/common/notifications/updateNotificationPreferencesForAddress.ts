import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateDelegateAddressPage } from "@/app/delegates/actions";

const NotificationPreferencesOptionsSchema = z.object({
  wants_proposal_created_email: z.union([
    z.literal("prompt"),
    z.literal("prompted"),
    z.boolean(),
  ]),
  wants_proposal_ending_soon_email: z.union([
    z.literal("prompt"),
    z.literal("prompted"),
    z.boolean(),
  ]),
  discord_webhook_url: z
    .string()
    .url()
    .startsWith("https://discord.com/api/webhooks/")
    .optional()
    .or(z.literal("")),
});

const UpdateNotificationPreferencesSchema = z.object({
  address: z.string().startsWith("0x"),
  email: z.string().email().optional(),
  options: NotificationPreferencesOptionsSchema,
});

const updateNotificationPreferencesForAddress = async (
  address: `0x${string}`,
  email: string,
  options: z.infer<typeof NotificationPreferencesOptionsSchema>
) => {
  try {
    const validatedData = UpdateNotificationPreferencesSchema.parse({
      address,
      email,
      options,
    });
    const { slug } = Tenant.current();
    const validatedAddress = validatedData.address.toLowerCase();
    const updateData: any = {
      notification_preferences: {
        last_updated: new Date(),
        wants_proposal_created_email:
          validatedData.options.wants_proposal_created_email,
        wants_proposal_ending_soon_email:
          validatedData.options.wants_proposal_ending_soon_email,
        discord_webhook_url: validatedData.options.discord_webhook_url,
      },
    };

    // Only update email if it's not empty
    if (validatedData.email && validatedData.email.trim() !== "") {
      updateData.email = validatedData.email;
    }

    const result = await prismaWeb2Client.delegateStatements.updateMany({
      where: {
        address: validatedAddress,
        dao_slug: slug,
      },
      data: updateData,
    });

    revalidateDelegateAddressPage(validatedAddress);

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid input: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
};

export const fetchUpdateNotificationPreferencesForAddress = cache(
  updateNotificationPreferencesForAddress
);
