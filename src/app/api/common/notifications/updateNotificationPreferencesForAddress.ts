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
});

const UpdateNotificationPreferencesSchema = z.object({
  address: z.string().startsWith("0x"),
  email: z.string().email().optional(),
  options: NotificationPreferencesOptionsSchema,
});

const updateNotificationPreferencesForAddress = async (
  address: `0x${string}`,
  email: string,
  message_hash: string,
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
    const result = await prismaWeb2Client.delegateStatements.update({
      where: {
        address_dao_slug_message_hash: {
          address: validatedAddress,
          dao_slug: slug,
          message_hash,
        },
      },
      data: {
        email: validatedData.email,
        notification_preferences: {
          last_updated: new Date(),
          wants_proposal_created_email:
            validatedData.options.wants_proposal_created_email,
          wants_proposal_ending_soon_email:
            validatedData.options.wants_proposal_ending_soon_email,
        },
      },
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
