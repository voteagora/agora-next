"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { retroPGFCategories } from "@/lib/constants";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";

export default function RetroPGFCategoryFilter() {
  const navigate = useNavigate();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { category: _categoryParam } = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const categoryParam = _categoryParam
    ? retroPGFCategories[_categoryParam as keyof typeof retroPGFCategories]
        .filter
    : retroPGFCategories.ALL.filter;

  const handleSelect = (value: string) => {
    navigate({
      to: (value !== "ALL"
        ? addSearchParam({ name: "category", value })
        : deleteSearchParam({ name: "category" })) as never,
    });
  };

  return (
    <Listbox as="div" value={categoryParam} onChange={handleSelect}>
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-wash text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {categoryParam}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="z-10 mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
            {Object.entries(retroPGFCategories).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {() => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        option.filter === categoryParam
                          ? "text-primary bg-neutral border-line"
                          : "text-tertiary border-transparent"
                      }`}
                    >
                      {option.filter}
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
