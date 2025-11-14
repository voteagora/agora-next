import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export interface Grant {
  id: string;
  slug: string;
  title: string;
  description: string;
  active: boolean;
  budget_range: string | null;
  deadline: Date | null;
  category: string | null;
  bottom_text_config?: {
    type: "text" | "confirmation";
    content?: string;
    items?: Array<{
      id: string;
      text: string;
      required: boolean;
    }>;
  } | null;
  form_schema: any;
  created_at: Date;
  updated_at: Date;
}

export const getGrants = cache(async (): Promise<Grant[]> => {
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
          form_schema: any;
          created_at: Date;
          updated_at: Date;
        }>
      >`
        SELECT * FROM get_grants_for_dao(${slug});
      `;

      return grants;
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
            form_schema: any;
            created_at: Date;
            updated_at: Date;
          }>
        >`
          SELECT 
            id, slug, title, description, active, budget_range, deadline,
            COALESCE(category, NULL) as category,
            COALESCE(form_schema, '[]'::jsonb) as form_schema,
            created_at, updated_at
          FROM alltenant.grants
          WHERE dao_slug = ${slug}::config.dao_slug
          AND active = TRUE
          ORDER BY created_at DESC;
        `;

        return grants;
      }
      throw functionError;
    }
  } catch (error) {
    console.error("Error fetching grants:", error);
    return [];
  }
});
