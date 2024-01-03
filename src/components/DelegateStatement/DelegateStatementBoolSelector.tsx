import { VStack } from "@/components/Layout/Stack";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelegateStatementFormValues } from "./DelegateStatementForm";
import { UseFormReturn } from "react-hook-form";

export default function DelegateStatementBoolSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
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
          <TabsTrigger
            variant="bool"
            value="yes"
            onClick={() => form.setValue("agreeCodeConduct", true)}
          >
            Yes
          </TabsTrigger>
          <TabsTrigger
            variant="bool"
            value="no"
            onClick={() => form.setValue("agreeCodeConduct", false)}
          >
            No
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </VStack>
  );
}
