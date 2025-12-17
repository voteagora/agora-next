import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import type { Grant } from "./getGrants";

export const getGrant = cache(
  async (grantSlug: string): Promise<Grant | null> => {
    const { slug } = Tenant.current();

    try {
      const grants = await prismaWeb2Client.$queryRaw<
        Array<{
          id: string;
          slug: string;
          title: string;
          description: string;
          active: boolean;
          budget_range: string | null;
          deadline: Date | null;
          category: string | null;
          bottom_text: string | null;
          bottom_text_config: any;
          form_schema: any;
          created_at: Date;
          updated_at: Date;
        }>
      >`
        SELECT 
          id,
          slug,
          title,
          description,
          active,
          budget_range,
          deadline,
          COALESCE(category, NULL) AS category,
          COALESCE(bottom_text, NULL) AS bottom_text,
          COALESCE(bottom_text_config, NULL) AS bottom_text_config,
          COALESCE(form_schema, '[]'::jsonb) AS form_schema,
          created_at,
          updated_at
        FROM alltenant.grants
        WHERE dao_slug::text = ${slug}
          AND slug = ${grantSlug}
          AND active = TRUE;
      `;

      return grants.length > 0 ? grants[0] : null;
    } catch (error) {
      console.error("Error fetching grant:", error);
      return null;
    }
  }
);
