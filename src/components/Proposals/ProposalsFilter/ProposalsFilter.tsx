"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { proposalsFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProposalsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get("filter");
  const [selected, setSelected] = useState(
    filterParam || proposalsFilterOptions.relevant.filter
  );

  const isRecentFilter = selected === proposalsFilterOptions.relevant.filter;

  useEffect(() => {
    const handleChanges = (value: string) => {
      const basePath = pathname === "/" ? "/" : "/proposals";
      isRecentFilter
        ? router.push(basePath)
        : router.push(`${basePath}?filter=${value}`);
    };

    handleChanges(selected);
  }, [router, selected, isRecentFilter, pathname]);

  return (
    <div className="relative text-primary">
      <Listbox value={selected} onChange={setSelected}>
        <Listbox.Button className="text-primary w-full sm:w-fit bg-neutral font-medium border-wash rounded-full py-2 px-4 flex items-center">
          {selected === proposalsFilterOptions.relevant.filter
            ? proposalsFilterOptions.relevant.value
            : proposalsFilterOptions.everything.value}
          <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
          {Object.values(proposalsFilterOptions).map((option) => (
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
