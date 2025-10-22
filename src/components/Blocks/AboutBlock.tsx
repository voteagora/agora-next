import { AboutBlockConfig } from "@/lib/blocks/types";
import Image from "next/image";
import {
  CurrencyDollarIcon,
  BellIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface AboutBlockProps {
  config: AboutBlockConfig;
}

const iconMap = {
  coins: CurrencyDollarIcon,
  notification: BellIcon,
  check: CheckCircleIcon,
  document: DocumentTextIcon,
  users: UsersIcon,
};

export function AboutBlock({ config }: AboutBlockProps) {
  return (
    <>
      {config.subtitle && (
        <h3 className="text-2xl font-black text-primary mt-12">
          {config.subtitle}
        </h3>
      )}
      <div className="mt-4 rounded-xl border border-line shadow-sm bg-infoSectionBackground">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6">
          {config.image_url && (
            <div className="w-full sm:w-1/2 relative h-[200px] sm:h-auto">
              <Image
                src={config.image_url}
                alt={config.title}
                fill
                className="rounded-lg object-cover object-center"
              />
            </div>
          )}
          <div className={config.image_url ? "sm:w-1/2" : "w-full"}>
            <h3 className="text-lg font-bold text-primary">{config.title}</h3>
            <p className="text-secondary mt-3 whitespace-pre-line">
              {config.description}
            </p>
          </div>
        </div>

        {config.tabs && config.tabs.length > 0 && (
          <div className="p-6 rounded-b-xl border-t border-line bg-infoSectionBackground">
            <div className="flex lg:flex-row flex-col gap-6 flex-wrap sm:flex-nowrap mb-4">
              {config.tabs.map((tab, index) => {
                const Icon = tab.icon_type
                  ? iconMap[tab.icon_type]
                  : DocumentTextIcon;
                return (
                  <div
                    key={index}
                    className="flex flex-row gap-3 justify-center items-center mt-3 flex-1 min-w-0"
                  >
                    <div className="min-w-[72px] h-[72px] justify-center items-center rounded-full border border-line flex sm:hidden lg:flex bg-tertiary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {tab.title}
                      </h3>
                      <p className="font-normal text-secondary">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
