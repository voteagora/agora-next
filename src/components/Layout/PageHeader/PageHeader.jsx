import { HStack } from "@/components/Layout/Stack";

export default function PageHeader({ headerText }) {
  return (
    <HStack
      justifyContent="justify-between"
      className="sm:mb-4 flex-col sm:flex-row mb-2 max-w-full"
    >
      <h1 className="text-primary text-2xl font-extrabold mb-0">
        {headerText}
      </h1>
      <HStack gap={4}></HStack>
    </HStack>
  );
}
