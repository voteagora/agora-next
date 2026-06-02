import Tenant from "../../../src/lib/tenant/tenant";

export type DelegatesLayout = "grid" | "list";

/** Matches DelegateContent / DelegatesTabs: list when toggle enabled, else grid. */
export function getDefaultDelegatesLayout(): DelegatesLayout {
  const { ui } = Tenant.current();
  return ui.toggle("delegates-layout-list")?.enabled ? "list" : "grid";
}

export function delegatesPath(layout?: DelegatesLayout): string {
  const resolved = layout ?? getDefaultDelegatesLayout();
  return `/delegates?layout=${resolved}`;
}
