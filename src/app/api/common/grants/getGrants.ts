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
  bottom_text: string | null;
  bottom_text_config: any;
  form_schema: any;
  created_at: Date;
  updated_at: Date;
}

export const getGrants = cache(async (): Promise<Grant[]> => {
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
        AND active = TRUE
      ORDER BY created_at DESC;
    `;

    return grants;
  } catch (error) {
    console.error("Error fetching grants:", error);
    return [];
  }
});
