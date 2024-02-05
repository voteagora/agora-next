"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";

const eventFilter = {
  all: "All",
  votes: "Votes",
  delegations: "Delegations",
  // TODO: frh - proposalCreation: "Proposal creations",
};

export default function FeedEventFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const _eventParam = searchParams?.get("event");
  const eventParam = _eventParam
    ? eventFilter[_eventParam as keyof typeof eventFilter]
    : eventFilter.all;

  const handleSelect = (value: string) => {
    router.push(
      value !== "all"
        ? addSearchParam("event", value)
        : deleteSearchParam("event")
    );
  };

  return (
    <Listbox as="div" value={eventParam} onChange={handleSelect}>
      {() => (
        <>
          <Listbox.Button className="w-full md:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {eventParam}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="z-10 mt-3 absolute bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1">
            {Object.entries(eventFilter).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {() => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        option === eventParam
                          ? "text-black bg-white border-[#ebebeb]"
                          : "text-[#66676b] border-transparent"
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
