"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { proposalsFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";

export default function ProposalsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ui } = Tenant.current();
  const tenantHaseasOO = ui.toggle("has-eas-oodao")?.enabled === true;

  const options = useMemo(() => {
    const base = [
      proposalsFilterOptions.relevant,
      proposalsFilterOptions.everything,
    ];

    if (tenantHaseasOO) {
      base.push(proposalsFilterOptions.tempChecks);
    }

    return base;
  }, [tenantHaseasOO]);

  const filterParam = searchParams?.get("filter");
  const selected = useMemo(() => {
    const candidate = filterParam ?? proposalsFilterOptions.relevant.filter;

    return options.some((option) => option.filter === candidate)
      ? candidate
      : proposalsFilterOptions.relevant.filter;
  }, [filterParam, options]);

  const handleChange = useCallback(
    (nextFilter: string) => {
      const basePath = pathname === "/" ? "/" : "/proposals";
      const isRelevant = nextFilter === proposalsFilterOptions.relevant.filter;

      if (isRelevant) {
        router.push(basePath);
      } else {
        router.push(`${basePath}?filter=${nextFilter}`);
      }
    },
    [pathname, router]
  );

  return (
    <div className="relative text-primary">
      <Listbox value={selected} onChange={handleChange}>
        <Listbox.Button className="text-primary w-full sm:w-fit bg-neutral font-medium border-wash rounded-full py-2 px-4 flex items-center">
          {
            (
              options.find((option) => option.filter === selected) ??
              proposalsFilterOptions.relevant
            ).value
          }
          <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-50 w-max">
          {options.map((option) => (
            <Listbox.Option key={option.filter} value={option.filter}>
              {({ selected }) => (
                <div
                  className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                    selected
                      ? "text-primary bg-neutral border-line"
                      : "text-tertiary border-transparent"
                  }`}
                >
                  {option.value}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}
