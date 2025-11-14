import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import type { Grant } from "./getGrants";

export const getGrant = cache(
  async (grantSlug: string): Promise<Grant | null> => {
    const { slug } = Tenant.current();

    try {
      // Try using SQL function first, fallback to direct query
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
            bottom_text_config: any;
            form_schema: any;
            created_at: Date;
            updated_at: Date;
          }>
        >`
          SELECT * FROM get_grant_by_slug(${slug}, ${grantSlug});
        `;

        return grants.length > 0 ? grants[0] : null;
      } catch (functionError: any) {
        // Fallback: query table directly if function doesn't exist
        if (
          functionError?.message?.includes("function") &&
          functionError?.message?.includes("does not exist")
        ) {
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
              bottom_text_config: any;
              form_schema: any;
              created_at: Date;
              updated_at: Date;
            }>
          >`
            SELECT 
              id, slug, title, description, active, budget_range, deadline,
              COALESCE(category, NULL) as category,
              COALESCE(bottom_text_config, NULL) as bottom_text_config,
              COALESCE(form_schema, '[]'::jsonb) as form_schema,
              created_at, updated_at
            FROM alltenant.grants
            WHERE dao_slug = ${slug}::config.dao_slug
            AND slug = ${grantSlug}
            AND active = TRUE;
          `;

          return grants.length > 0 ? grants[0] : null;
        }
        throw functionError;
      }
    } catch (error) {
      console.error("Error fetching grant:", error);
      return null;
    }
  }
);
