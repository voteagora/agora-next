import { VStack } from "@/components/Layout/Stack";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  onSelectionChanged: (newSelection: "yes" | "no") => void;
  selection: "yes" | "no" | undefined;
};

// TODO: frh -> ts
export default function DelegateStatementBoolSelector({
  onSelectionChanged,
  selection,
}: Props) {
  return (
    <VStack>
      <h4 className="font-bold text-xs mb-2">
        Agree with{" "}
        <a href="https://gov.optimism.io/t/code-of-conduct/5751">
          Delegate Code of Conduct
        </a>
      </h4>
      <Tabs>
        <TabsList variant="bool">
          <TabsTrigger variant="bool" value="yes">
            Yes
          </TabsTrigger>
          <TabsTrigger variant="bool" value="no">
            No
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </VStack>
  );
}
