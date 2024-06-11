import React, { useState } from "react";
import { Button } from "@/components/Button";
import { XMarkIcon } from "@heroicons/react/20/solid";

// mock data until we have real delegates
// these objects are also super light because the designs are not final
// and thus I don't know what we will need to include here
const MOCK_DELEGATES = [
  {
    address: "0x1234",
    name: "Delegate 1",
  },
  {
    address: "0x5678",
    name: "Delegate 2",
  },
  {
    address: "0x9abc",
    name: "Delegate 3",
  },
];

const MOCK_CLAIM_AMOUNT = 4455;

const getPercentage = (count: number, total: number) => {
  const percent = count / total;
  if (Number.isInteger(percent)) {
    return percent.toFixed(0);
  } else {
    return percent.toFixed(2);
  }
};

const DelegateSelector = ({ onSuccess }: { onSuccess: () => void }) => {
  const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);

  const isSelectedDelegate = (address: string) =>
    selectedDelegates.includes(address);

  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
          <h2 className="font-black text-2xl">Choose one or more delegates</h2>
          <p className="text-agora-stone-700">blah blah blah</p>
          <div className="mt-10">
            {MOCK_DELEGATES.map((delegate, idx) => (
              <div
                key={`delegate-${idx}`}
                className={`${isSelectedDelegate(delegate.address) ? "border-agora-stone-700 bg-agora-stone-50" : "border-agora-stone-100"} cursor-pointer transition-all border rounded-lg p-4 mt-2`}
                onClick={() => {
                  setSelectedDelegates((prev) =>
                    isSelectedDelegate(delegate.address)
                      ? prev.filter((address) => address !== delegate.address)
                      : [...prev, delegate.address]
                  );
                }}
              >
                <h3 className="font-black text-lg">{delegate.name}</h3>
                <p className="text-agora-stone-700">{delegate.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
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

export default DelegateSelector;
