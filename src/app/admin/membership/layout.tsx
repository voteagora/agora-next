import Tenant from "@/lib/tenant/tenant";
import { buildPageMetadata } from "@/app/lib/utils/metadata";

export async function generateMetadata() {
  const { brandName } = Tenant.current();

  return buildPageMetadata({
    title: `Membership Admin | ${brandName}`,
    description: `Manage ${brandName} membership administration.`,
    path: "/admin/membership",
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function MembershipAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
