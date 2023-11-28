"use client";

import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { HStack } from "./Layout/Stack";

type Props = {
  onSelectionChanged: (newSelection: any) => void;
  selection: string;
  options: string[];
};

export function Switch({ onSelectionChanged, selection, options }: Props) {
  return (
    <HStack
      className={css`
        border-radius: ${theme.borderRadius.md};
        border-width: ${theme.spacing.px};
        border-color: ${theme.colors.gray["300"]};
        overflow: hidden;
        width: 100%;
        padding: ${theme.spacing["1"]};
      `}
      gap={2}
    >
      <div
        onClick={() => onSelectionChanged(options[0])}
        className={css`
          ${optionStyle};
          ${selection === options[0] && selectedStyle};
        `}
      >
        {options[0]}
      </div>
      <div
        onClick={() => onSelectionChanged(options[1])}
        className={css`
          ${optionStyle};
          ${selection === options[1] && selectedStyle};
        `}
      >
        {options[1]}
      </div>
    </HStack>
  );
}

const optionStyle = css`
  padding: ${theme.spacing["3"]} ${theme.spacing["3"]};
  flex: 1;
  text-align: center;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.gray["4f"]};
  font-weight: 500;

  :hover {
    background: ${theme.colors.gray.fa};
  }
`;

const selectedStyle = css`
  background: ${theme.colors.gray.fa};
  color: ${theme.colors.black};
  font-weight: bold;
`;
