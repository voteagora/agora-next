import Tenant from "@/lib/tenant/tenant";

export function isForumSurveysEnabled(): boolean {
  const tenant = Tenant.current();
  return tenant.ui.toggle("forums/surveys")?.enabled === true;
}
