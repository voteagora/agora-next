import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import Tenant from "@/lib/tenant/tenant";

export default function NotFound() {
  const copy = Tenant.current().ui.copy;

  return <ResourceNotFound message={copy.delegates.profile.notFound} />;
}
