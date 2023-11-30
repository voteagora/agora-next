import { css } from "@emotion/css";
import { HStack } from "@/components/Layout/Stack";
import * as theme from "@/styles/theme";
import { Button } from "../ui/button";

export function MultiButtons({
  buttonsProps,
}: {
  buttonsProps: [string, () => void][];
}) {
  return (
    <HStack
      className={css`
        margin-top: ${theme.spacing["4"]};
      `}
      gap={4}
    >
      {buttonsProps.map((buttonProps, index) => {
        return (
          <Button
            key={index}
            variant="outline"
            type="button"
            onClick={buttonProps[1]}
          >
            {buttonProps[0]}
          </Button>
        );
      })}
    </HStack>
  );
}
