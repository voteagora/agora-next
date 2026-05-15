/*
 * TanStack Start port of src/app/delegates/create/page.tsx.
 * URL: /delegates/create
 */

import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import CurrentDelegateStatement from "@/components/DelegateStatement/CurrentDelegateStatement";

export const Route = createFileRoute("/delegates/create")({
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("delegates");
    const { title, description } = page?.meta ?? {
      title: "Create Delegate Statement",
      description: "",
    };
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  component: () => <CurrentDelegateStatement />,
});
