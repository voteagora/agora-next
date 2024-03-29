"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { citizensFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CitizensFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderByParam = searchParams.get("citizensOrderBy");
  const [selected, setSelected] = useState(orderByParam || "shuffle");

  // TODO: -> this router.push is super slow but window.history.pushState does not revalidate the query and the
  // problem using revalidatePath is that it erases searchParams, another idea to optimize this filter is to prefetch
  // the data, also use hooks useAddSearchParam and useDeleteSearchParam
  useEffect(() => {
    const handleChanges = (value) => {
      value === "shuffle"
        ? router.push("/delegates?tab=citizens")
        : router.push(`/delegates?tab=citizens&citizensOrderBy=${value}`);
    };

    handleChanges(selected);
  }, [router, selected]);

  return (
    <Listbox as="div" value={selected} onChange={setSelected}>
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {citizensFilterOptions[selected]?.value || "Shuffle"}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.entries(citizensFilterOptions).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ selected }) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        selected
                          ? "text-black bg-white border-[#ebebeb]"
                          : "text-[#66676b] border-transparent"
                      }`}
                    >
                      {option.value}
                    </li>
                  );
                }}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  );
}
