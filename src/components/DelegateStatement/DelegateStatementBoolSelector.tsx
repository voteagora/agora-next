import { VStack } from "@/components/Layout/Stack";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import { useState } from "react";

export default function DelegateStatementBoolSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const [agreeCodeConduct, setAgreeCodeConduct] = useState(false);

  const handleAgreeCodeConduct = (agreeCodeConduct: boolean) => {
    setAgreeCodeConduct(agreeCodeConduct);
    form.setValue("agreeCodeConduct", agreeCodeConduct);
  };

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
            data-state={agreeCodeConduct ? "active" : "inactive"}
            onClick={() => handleAgreeCodeConduct(true)}
          >
            Yes
          </TabsTrigger>
          <TabsTrigger
            variant="bool"
            value="no"
            data-state={!agreeCodeConduct ? "active" : "inactive"}
            onClick={() => handleAgreeCodeConduct(false)}
          >
            No
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </VStack>
  );
}
