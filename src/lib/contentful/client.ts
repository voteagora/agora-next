// Build and setup a Contentful client to interact with the API
import { createClient } from "contentful";
import Tenant from "@/lib/tenant/tenant";

export const getContentfulClient = () => {
  const { ui } = Tenant.current();

  if (!ui.contentful?.spaceId) {
    throw new Error("Contentful space ID missing for tenant");
  }

  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Contentful access token is missing");
  }

  return createClient({
    space: ui.contentful.spaceId,
    accessToken: accessToken,
    environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
  });
};
