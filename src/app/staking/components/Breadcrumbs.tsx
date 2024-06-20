"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const onBackButton = () => {
    if (step > 1) {
      onClick(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-row gap-3 mb-5 items-center">
      <Button
        className="w-8 h-8 border bg-neutral rounded-full items-center justify-center mr-2 shadow-newDefault"
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
