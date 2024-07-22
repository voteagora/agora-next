"use client";

import { HStack } from "../Layout/Stack";

type Props = {
  onSelectionChanged: (newSelection: any) => void;
  selection: string;
  options: string[];
};

const optionStyle =
  "p-[5px] flex-1 text-center cursor-pointer rounded-md text-veil font-medium hover:bg-line";

const selectedStyle = "bg-line text-black font-semibold";

export function Switch({ onSelectionChanged, selection, options }: Props) {
  return (
    <HStack
      className="rounded-md border border-line overflow-hidden w-full p-1"
      gap={2}
    >
      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => onSelectionChanged(option)}
          className={`${optionStyle}  ${
            selection === option ? selectedStyle : ""
          }`}
        >
          {option}
        </div>
      ))}
    </HStack>
  );
}
