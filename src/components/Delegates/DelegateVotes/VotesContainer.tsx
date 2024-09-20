"use client";

import React, { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";

const filterOptions = {
  onchain: {
    value: "onchain",
    label: "On-chain votes",
  },
  snapshot: {
    value: "snapshot",
    label: "Snapshot votes",
  },
};

const VotesContainer = ({
  snapshotVotes,
  onchainVotes,
}: {
  snapshotVotes: React.ReactElement;
  onchainVotes: React.ReactElement;
}) => {
  const [activeTab, setActiveTab] = useState<"snapshot" | "onchain">("onchain");

  // right now, only ENS uses snapshot, so we want to show filter.
  // Otherwise, just show the onchainVotes
  const slug = Tenant.current().slug;
  if (slug !== DaoSlug.ENS) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex flex-row justify-between items-center relative">
          <h2 className="text-black text-2xl font-bold flex-grow">
            Past Votes
          </h2>
        </div>
        <div className="block">{onchainVotes}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row justify-between items-center relative">
        <h2 className="text-black text-2xl font-bold flex-grow">Past Votes</h2>
        <Listbox value={activeTab} onChange={setActiveTab}>
          <Listbox.Button className="w-[175px] bg-wash text-primary font-medium border-none rounded-full py-2 px-4 flex items-center justify-between">
            <span>
              {activeTab === "onchain"
                ? filterOptions.onchain.label
                : filterOptions.snapshot.label}
            </span>
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Transition
            className="absolute z-10 right-0"
            enter="transition duration-00 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max right-0 top-4">
              {Object.values(filterOptions).map((option) => (
                <Listbox.Option key={option.value} value={option.value}>
                  {({ selected }) => (
                    <div
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        selected
                          ? "text-primary bg-white border-line"
                          : "text-secondary border-transparent"
                      }`}
                    >
                      {option.label}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <div className={activeTab === "onchain" ? "hidden" : "block"}>
        {snapshotVotes}
      </div>
      <div className={activeTab === "onchain" ? "block" : "hidden"}>
        {onchainVotes}
      </div>
    </div>
  );
};

export default VotesContainer;
