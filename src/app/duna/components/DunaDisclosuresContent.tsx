"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIDunaDisclosuresConfig } from "@/lib/tenant/tenantUI";

export default function DunaDisclosuresContent() {
  const { ui } = Tenant.current();
  const config = ui.toggle("duna-disclosures");

  if (!config?.enabled || !config?.config) {
    return null;
  }

  const disclosuresConfig = config.config as UIDunaDisclosuresConfig;

  return (
    <div className="mt-6" id="duna-disclosures">
      <div className="border border-line rounded-2xl p-6 bg-wash shadow-sm text-primary">
        <div className="text-base leading-relaxed">
          {disclosuresConfig.content}
        </div>
        {disclosuresConfig.disclaimer && (
          <div className="mt-6 pt-6 border-t border-line text-sm">
            {disclosuresConfig.disclaimer}
          </div>
        )}
      </div>
    </div>
  );
}
