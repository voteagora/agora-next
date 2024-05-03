"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BreadcrumbsNavProps {
  step: number;
  title: string;
  totalSteps: number;
  onClick: (value: number) => void;
}

export const BreadcrumbsNav = ({
  step,
  title,
  onClick,
  totalSteps = 3,
}: BreadcrumbsNavProps) => {
  const router = useRouter();

  // Prefetch the staking page when the user is on the first step
  if (step === 1) {
    router.prefetch("/staking");
  }

  const onBackButton = () => {
    if (step > 1) {
      onClick(step - 1);
    } else {
      router.push("/staking");
    }
  };

  return (
    <div className="flex flex-row gap-3 mb-5 items-center">
      <Button
        className="w-8 h-8 border bg-white rounded-full items-center justify-center mr-2 shadow-newDefault"
        variant="secondary"
        onClick={onBackButton}
      >
        {" "}
        ←{" "}
      </Button>

      <div className="text-xl font-bold">{title}</div>
      <div className="text-sm">
        Step {step}/{totalSteps}
      </div>
    </div>
  );
};
