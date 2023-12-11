import { HStack } from "@/components/Layout/Stack";
import { Button } from "../ui/button";
import styles from "./styles.module.scss";

export function MultiButtons({
  buttonsProps,
}: {
  buttonsProps: [string, () => void][];
}) {
  return (
    <HStack className={styles.multi_buttons} gap={4}>
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
