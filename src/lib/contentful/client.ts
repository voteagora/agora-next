// Build and setup a Contentful client to interact with the API
import { createClient } from "contentful";
import Tenant from "@/lib/tenant/tenant";

export const getContentfulClient = () => {
  const { ui } = Tenant.current();

  if (!ui.contentful?.spaceId || !ui.contentful?.accessToken) {
    throw new Error("Contentful configuration missing for tenant");
  }

  return createClient({
    space: ui.contentful.spaceId,
    accessToken: ui.contentful.accessToken,
    environment: ui.contentful.environment || "master", // default in Contentful
  });
};
