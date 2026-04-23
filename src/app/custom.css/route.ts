import Tenant from "@/lib/tenant/tenant";
import { buildTenantCssVars } from "@/lib/tenant/tenantCssVars";

export async function GET() {
  const { ui } = Tenant.current();
  const vars = buildTenantCssVars(ui?.customization);

  const root = `
    :root {
      ${Object.entries(vars)
        .map(([key, value]) => `${key}: rgb(${value});`)
        .join("\n")}
    }
  `;

  return new Response(root, {
    status: 200,
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
