import React from "react";
import { Button } from "@/components/Button";

interface BreadcrumbsNavProps {
  step: number;
  title: string;
  totalSteps: number;
  setStep: (step: number) => void;
}

export const BreadcrumbsNav = ({
  step,
  title,
  setStep,
  totalSteps = 3,
}: BreadcrumbsNavProps) => {
  return (
    <div className="flex flex-row gap-3 mb-4 items-center">
      <Button
        className="w-10 h-10 shadow-newDefault items-center justify-center"
        onClick={() => {
          setStep(step > 1 ? step - 1 : step);
        }}
      >
        ←
      </Button>

      <div className="text-xl font-bold">{title}</div>
      <div className="text-sm">
        Step {step}/{totalSteps}
      </div>
    </div>
  );
};
