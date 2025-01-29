import { ContentfulConfig } from "@/lib/tenant/tenantUI";
import { useState, useEffect } from "react";
import { getContentfulClient } from "@/lib/contentful/client";
import Tenant from "@/lib/tenant/tenant";

export const useContentful = (
  contentType: keyof ContentfulConfig["contentMapping"]["pages"]
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { ui } = Tenant.current();
        const contentfulMapping = ui.contentful?.contentMapping.pages ?? {};
        const entryId = contentfulMapping[contentType];

        if (!entryId) {
          throw new Error(`No content found for ${contentType}`);
        }

        const client = getContentfulClient();
        const entry = await client.getEntry(entryId);
        setData(entry);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType]);

  return { data, loading, error };
};
