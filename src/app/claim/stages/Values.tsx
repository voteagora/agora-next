import React from "react";
import { Button } from "../../../components/ui/button";
import { Priority, PriorityMetadata } from "../types";

const PriorityCard = ({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`${active ? "bg-agora-stone-50" : "bg-white"} flex flex-col py-4 border border-agora-stone-100 rounded-lg p-4 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-row items-center space-x-2">
        <span>{icon}</span>
        <span className="flex-1 mr-4 font-medium">{title}</span>
      </div>
      <span className="font-medium text-agora-stone-700">{description}</span>
    </div>
  );
};

const ValuesStage = ({
  onSuccess,
  values,
  setValues,
}: {
  onSuccess: () => void;
  values: string[];
  setValues: (values: string[]) => void;
}) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <h1 className="text-2xl font-black">
            Choose a delegate who shares your values
          </h1>
          <p className="text-agora-stone-700 mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
            lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Aliquam eu lectus dignissim, porta
            tortor nec.
          </p>
          <div className="mt-4">
            <h3 className="font-semibold">Select 3 governance priorities:</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.values(Priority).map((priority, idx) => {
              return (
                <PriorityCard
                  key={`priority-${idx}`}
                  title={priority}
                  description={
                    PriorityMetadata[priority as Priority].description
                  }
                  active={values.includes(priority)}
                  onClick={() => {
                    if (values.length >= 3 && !values.includes(priority)) {
                      // throw toast
                      return;
                    }
                    if (values.includes(priority)) {
                      setValues(values.filter((v) => v !== priority));
                    } else {
                      setValues([...values, priority]);
                    }
                  }}
                  icon={PriorityMetadata[priority as Priority].icon}
                />
              );
            })}
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <h1 className="text-2xl font-black">Proceed to delegate selection</h1>
          <div className="mt-6">
            {/* TODO (mg) fix this button */}
            <Button
              variant={values.length === 3 ? "default" : "secondary"}
              className="w-full"
              onClick={() => {
                onSuccess();
              }}
            >
              Continue
            </Button>
          </div>
        </div>
        <div>dont forget FAQs</div>
      </section>
    </main>
  );
};

export default ValuesStage;
