import prisma from "@/app/lib/prisma";
import { cache } from "react";
import Tenant from "@/lib/tenant/tenant";

const updateNotificationPreferencesForAddress = async (
  address: `0x${string}`,
  email: string,
  options: {
    wants_proposal_created_email: "prompt" | "prompted" | true | false;
    wants_proposal_ending_soon_email: "prompt" | "prompted" | true | false;
  }
) => {
  const { slug } = Tenant.current();

  return prisma.delegateStatements.update({
    where: {
      address_dao_slug: { address: address.toLowerCase(), dao_slug: slug },
    },
    data: {
      email: email,
      notification_preferences: {
        last_updated: new Date(),
        wants_proposal_created_email: options.wants_proposal_created_email,
        wants_proposal_ending_soon_email:
          options.wants_proposal_ending_soon_email,
      },
    },
  });
};

export const fetchUpdateNotificationPreferencesForAddress = cache(
  updateNotificationPreferencesForAddress
);
