"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface BreadcrumbsProps {
  step: number;
  title: string;
  totalSteps: number;
  onClick: (value: number) => void;
}

export const Breadcrumbs = ({
  step,
  title,
  onClick,
  totalSteps = 3,
}: BreadcrumbsProps) => {
  const onBackButton = () => {
    if (step > 1) {
      onClick(step - 1);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-row gap-3 mb-5 items-center text-primary">
      <Button
        className="w-8 h-8 border bg-neutral rounded-full items-center justify-center mr-2 shadow-newDefault"
        variant="secondary"
        onClick={onBackButton}
      >
        {" "}
        ←{" "}
      </Button>

      <div className="text-xl font-bold">{title}</div>
      <div className="text-sm text-secondary">
        Step {step}/{totalSteps}
      </div>
    </div>
  );
};
