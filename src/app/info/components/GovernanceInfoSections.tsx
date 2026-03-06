"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIGovernanceInfoConfig } from "@/lib/tenant/tenantUI";

export default function GovernanceInfoSections() {
  const { ui } = Tenant.current();
  const config = ui.toggle("info/governance-sections");
  console.log("test");
  if (!config?.enabled || !config?.config) {
    return null;
  }

  const governanceConfig = config.config as UIGovernanceInfoConfig;
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  if (!governanceConfig.sections || governanceConfig.sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-primary">
        {governanceConfig.title}
      </h2>
      <div className="flex flex-col border border-line rounded-xl overflow-hidden bg-wash">
        {governanceConfig.sections.map((section, index) => {
          const isLast = index === governanceConfig.sections.length - 1;
          return (
            <div
              key={section.id || index}
              id={section.id}
              className={`flex flex-col space-y-3 px-6 py-6 ${!isLast ? "border-b border-line" : ""}`}
            >
              <h2 className="text-lg font-bold text-primary">
                {section.title}
              </h2>
              <div className="text-secondary text-sm leading-relaxed">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
