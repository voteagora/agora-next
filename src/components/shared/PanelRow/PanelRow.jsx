"use client";

import { HStack } from "@/components/Layout/Stack";

export const PanelRow = ({ title, detail }) => {
  return (
    <HStack gap="2" className="items-baseline justify-between">
      <span className="whitespace-nowrap text-black">{title}</span>
      <span className="text-sm text-gray-4f text-right">{detail}</span>
    </HStack>
  );
};
