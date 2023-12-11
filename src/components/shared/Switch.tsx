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
      <div
        onClick={() => onSelectionChanged(options[0])}
        className={`${optionStyle}  ${
          selection === options[0] ? selectedStyle : ""
        }`}
      >
        {options[0]}
      </div>
      <div
        onClick={() => onSelectionChanged(options[1])}
        className={`${optionStyle}  ${
          selection === options[1] ? selectedStyle : ""
        }`}
      >
        {options[1]}
      </div>
    </HStack>
  );
}
