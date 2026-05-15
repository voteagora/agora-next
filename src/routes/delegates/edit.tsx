/*
 * TanStack Start port of src/app/delegates/edit/page.tsx.
 * URL: /delegates/edit
 */

import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import CurrentDelegateStatement from "@/components/DelegateStatement/CurrentDelegateStatement";

export const Route = createFileRoute("/delegates/edit")({
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("delegates");
    const { title, description } = page?.meta ?? {
      title: "Edit Delegate Statement",
      description: "",
    };
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  component: () => <CurrentDelegateStatement />,
});
