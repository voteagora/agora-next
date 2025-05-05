import { parseAsString } from "nuqs/server";

// Define the tab parameter schema for server-side parsing
export const profileSearchParams = {
  tab: parseAsString.withDefault("statement"),
};

// Server-side loader function
export const loadProfileSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
) => {
  // Get the tab value from search params
  const tabValue =
    typeof searchParams.tab === "string" ? searchParams.tab : undefined;

  // Validate the tab value
  const validTabs = ["statement", "participation", "delegations"];
  const tab = tabValue && validTabs.includes(tabValue) ? tabValue : "statement";

  return {
    tab,
  };
};
