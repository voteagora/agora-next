import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { DelegateSocialLinks } from "@/components/Delegates/DelegateCard/DelegateSocialLinks";
import { Priority, PriorityMetadata } from "../types";

// mock data until we have real delegates
// these objects are also super light because the designs are not final
// and thus I don't know what we will need to include here
const MOCK_DELEGATES = [
  {
    address: "0x1234",
    name: "Delegate 1",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
  {
    address: "0x5678",
    name: "Delegate 2",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
  {
    address: "0x9abc",
    name: "Delegate 3",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
  {
    address: "0x4554",
    name: "Delegate 4",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
  {
    address: "04205",
    name: "Delegate 5",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
  {
    address: "0x8854",
    name: "Delegate 6",
    priorities: [
      Priority.COMMUNITY,
      Priority.DECENTRALIZATION,
      Priority.TECHNOLOGY,
    ],
  },
];

const MAX_DELEGATES = 4;
const MOCK_CLAIM_AMOUNT = 4455;

const getPercentage = (count: number, total: number) => {
  const percent = count / total;
  if (Number.isInteger(percent)) {
    return percent.toFixed(0);
  } else {
    return percent.toFixed(2);
  }
};

const PriorityPill = ({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`${
        active ? "border-black" : "border-agora-stone-100"
      } flex flex-row border rounded-full px-4 py-2 cursor-pointer`}
      onClick={onClick}
    >
      <span className="flex-1 font-medium text-agora-stone-700">
        <span className="mr-2">{icon}</span>
        <span>{title}</span>
      </span>
    </div>
  );
};

const DelegateCard = ({
  onClick,
  active,
  priorities,
}: {
  onClick: () => void;
  active: boolean;
  priorities: Priority[];
}) => {
  return (
    <div
      className="border border-agora-stone-100 rounded-xl p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-row">
        <span className="h-10 w-10 rounded-full bg-agora-stone-500 mr-4"></span>
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold">Delegate 1</h3>
          <span className="text-xs text-agora-stone-700 font-semibold">
            700k total voting power • 8 delegates
          </span>
        </div>
        <DelegateSocialLinks discord="d" twitter="a" warpcast="f" />
      </div>
      <p className="mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
        lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor
        nec.
      </p>

      <div className="flex flex-row space-x-4 mt-4">
        {priorities.map((priority, idx) => (
          <PriorityPill
            key={`priority-${idx}`}
            title={priority}
            icon={PriorityMetadata[priority].icon}
            active={false}
          />
        ))}
      </div>
    </div>
  );
};

const DelegationStage = ({
  onSuccess,
  values,
  setValues,
}: {
  onSuccess: () => void;
  values: string[];
  setValues: (values: string[]) => void;
}) => {
  const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);

  const isSelectedDelegate = (address: string) =>
    selectedDelegates.includes(address);

  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <h2 className="font-black text-2xl">Choose one or more delegates</h2>
          <p className="text-agora-stone-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
            lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Aliquam eu lectus dignissim, porta
            tortor nec.
          </p>
          <div>
            <div className="flex flex-row flex-wrap gap-x-2 gap-y-2 mt-4">
              {Object.values(Priority).map((priority, idx) => (
                <PriorityPill
                  key={`priority-${idx}`}
                  title={priority}
                  icon={PriorityMetadata[priority].icon}
                  active={false}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {MOCK_DELEGATES.map((delegate, idx) => (
              <DelegateCard
                onClick={() => {
                  setSelectedDelegates((prev) =>
                    isSelectedDelegate(delegate.address)
                      ? prev.filter((address) => address !== delegate.address)
                      : [...prev, delegate.address]
                  );
                }}
                key={`delegate-${idx}`}
                active={isSelectedDelegate(delegate.address)}
                priorities={delegate.priorities}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6 sticky top-4">
          <h2 className="font-black text-2xl mb-6">Your delegates</h2>
          {selectedDelegates.length === 0 ? (
            <p className="text-agora-stone-700">
              You have not selected any delegates
            </p>
          ) : (
            selectedDelegates.map((address, idx) => (
              <div
                key={`selected-delegate-${idx}`}
                className="first:mt-0 mt-4 flex flex-row items-center"
              >
                <span className="h-10 w-10 rounded-full bg-agora-stone-100 mr-4"></span>
                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold">Delegate {idx + 1}</h3>
                  <p className="text-agora-stone-700 text-xs font-semibold">
                    123 SCROLL
                  </p>
                </div>
                <div className="flex flex-col items-center mr-4">
                  <h3 className="font-semibold">
                    {getPercentage(100, selectedDelegates.length)}%
                  </h3>
                  <p className="text-agora-stone-700 text-xs font-semibold">
                    {getPercentage(MOCK_CLAIM_AMOUNT, selectedDelegates.length)}{" "}
                    SCROLL
                  </p>
                </div>
                <div className="">
                  <XMarkIcon
                    className="h-6 w-6 text-agora-stone-700 cursor-pointer"
                    onClick={() => {
                      setSelectedDelegates((prev) =>
                        prev.filter((a) => a !== address)
                      );
                    }}
                  />
                </div>
              </div>
            ))
          )}
          <div className="mt-6">
            <Button
              className="w-full"
              onClick={() => {
                onSuccess();
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DelegationStage;
