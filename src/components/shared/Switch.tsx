"use client";

import { HStack } from "../Layout/Stack";
import styles from "./styles.module.scss";

type Props = {
  onSelectionChanged: (newSelection: any) => void;
  selection: string;
  options: string[];
};

const optionStyle = styles.switch__option;

const selectedStyle = styles.switch__selected;

export function Switch({ onSelectionChanged, selection, options }: Props) {
  return (
    <HStack className={styles.switch} gap={2}>
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
