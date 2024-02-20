"use client";

import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useDelegateVotesContext } from "@/contexts/DelegateVotesContext";
import { delegatesVotesSortOptions } from "@/lib/constants";

export default function DelegatesVotesSort({ fetchDelegateVotes }) {
  const {
    delegatesVotesSort,
    setDelegatesVotesSort,
    setDelegateVotes,
    setMeta,
  } = useDelegateVotesContext();

  const handleSort = async (val) => {
    const page = 1;
    const data = await fetchDelegateVotes(
      page,
      delegatesVotesSortOptions[val]?.sortOrder
    );
    setMeta(data.meta);
    // NOTE: delegatesVotes should be reinitialized with data.votes only since the order is different
    setDelegateVotes(data.votes);
    setDelegatesVotesSort(val);
  };

  return (
    <Listbox as="div" value={delegatesVotesSort} onChange={handleSort}>
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {delegatesVotesSortOptions[delegatesVotesSort].value}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute right-4 sm:right-auto bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
            {Object.entries(delegatesVotesSortOptions).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ delegatesVotesSort }) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        delegatesVotesSort
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
