"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIGovernanceInfoConfig } from "@/lib/tenant/tenantUI";

export default function GovernanceInfoSections() {
  const { ui } = Tenant.current();
  const config = ui.toggle("info/governance-sections");

  if (!config?.enabled || !config?.config) {
    return null;
  }

  const governanceConfig = config.config as UIGovernanceInfoConfig;
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  if (!governanceConfig.sections || governanceConfig.sections.length === 0) {
    return null;
  }

  const bgClass = useNeutral ? "bg-neutral" : "bg-wash";

  return (
    <div className="flex flex-col">
      {governanceConfig.title && (
        <h3 className="text-2xl font-black text-primary mt-12">
          {governanceConfig.title}
        </h3>
      )}
      <div
        className={`flex flex-col mb-8 mt-4 ${bgClass} border border-line shadow-newDefault rounded-xl overflow-hidden`}
      >
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
