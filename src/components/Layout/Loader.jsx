import { HStack } from "./Stack";

export default function Loader() {
  return (
    <HStack
      key="loader"
      className="gl_loader justify-center py-6 text-sm text-secondary"
    >
      Loading...
    </HStack>
  );
}
