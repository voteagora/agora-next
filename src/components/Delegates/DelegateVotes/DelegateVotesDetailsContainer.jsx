import React from "react";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { VStack } from "@/components/Layout/Stack";

function VoteDetailsContainer({ children }) {
  return (
    <VStack
      gap="3"
      className={css`
        border-radius: ${theme.borderRadius.lg};
        border-width: ${theme.spacing.px};
        border-color: ${theme.colors.gray.eb};
        background: ${theme.colors.white};
        box-shadow: ${theme.shadow};
        max-height: 15rem;
      `}
    >
      {children}
    </VStack>
  );
}

export default VoteDetailsContainer;
