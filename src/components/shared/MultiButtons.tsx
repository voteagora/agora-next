import { HStack } from "@/components/Layout/Stack";
import { Button } from "../ui/button";

export function MultiButtons({
  buttonsProps,
}: {
  buttonsProps: [string, () => void][];
}) {
  return (
    <HStack className="mt-4" gap={4} justifyContent="justify-between">
      {buttonsProps.map((buttonProps, index) => {
        return (
          <Button
            key={index}
            variant="outline"
            type="button"
            onClick={buttonProps[1]}
            className="flex-1"
          >
            {buttonProps[0]}
          </Button>
        );
      })}
    </HStack>
  );
}
