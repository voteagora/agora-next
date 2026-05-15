import { createRouter } from "@tanstack/react-router";

import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <ResourceNotFound />,
  });
}
