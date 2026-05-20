"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { retroPGFSort } from "@/lib/constants";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";

export default function RetroPGFSort() {
  const navigate = useNavigate();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { orderBy: _orderByParam } = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const orderByParam = _orderByParam
    ? retroPGFSort[_orderByParam as keyof typeof retroPGFSort]
    : retroPGFSort.mostAwarded;

  const handleSelect = (value: string) => {
    navigate({
      to: (value !== "byMostRPGFReceived"
        ? addSearchParam({ name: "orderBy", value })
        : deleteSearchParam({ name: "orderBy" })) as never,
    });
  };

  return (
    <Listbox as="div" value={orderByParam} onChange={handleSelect}>
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-wash text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {orderByParam}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="z-10 mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
            {Object.entries(retroPGFSort).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {() => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        option === orderByParam
                          ? "text-primary bg-neutral border-line"
                          : "text-tertiary border-transparent"
                      }`}
                    >
                      {option}
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
