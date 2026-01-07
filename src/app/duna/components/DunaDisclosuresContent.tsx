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
    <div id="duna-administration" className="mt-8">
      <div
        style={{
          color: "var(--stone-700, #4F4F4F)",
          fontSize: "14px",
          lineHeight: "19px",
        }}
      >
        {disclosuresConfig.content}
      </div>

      {disclosuresConfig.disclaimer && (
        <div className="mt-12 pt-6 border-t border-line">
          {disclosuresConfig.disclaimer}
        </div>
      )}
    </div>
  );
}
