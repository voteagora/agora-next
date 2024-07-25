import Markdown from "@/components/shared/Markdown/Markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { FormEvent } from "react";

export default function DelegateStatementFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const delegateStatement = useWatch({ name: "delegateStatement" });
  const { namespace } = Tenant.current();

  const showTemplate = namespace === TENANT_NAMESPACES.OPTIMISM;

  const addDefaultValueOnFocus = (e: FormEvent) => {
    if ((e.target as HTMLInputElement).value === "") {
      (e.target as HTMLInputElement).value = defaultValue;
    }
  };

  // Keep this value multiline
  const defaultValue = `A brief intro to yourself:

A message to the community and ecosystem:

Discourse username:`;

  return (
    <div className="flex flex-col py-8 px-6 border-b border-line">
      <Tabs defaultValue="write">
        <div className="flex flex-row gap-4 justify-between items-baseline">
          <div className="flex flex-row items-baseline gap-2">
            <h3 className="font-bold">Delegate statement</h3>
            {showTemplate && (
              <a
                href="https://gov.optimism.io/t/delegate-commitments/235"
                rel="noreferrer"
                target="_blank"
              >
                <p className="text-sm opacity-50">View template</p>
              </a>
            )}
          </div>
          <TabsList className="gap-0">
            <TabsTrigger variant="gray" className="text-sm" value="write">
              Write
            </TabsTrigger>
            <TabsTrigger variant="gray" className="text-sm" value="preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="write">
          <FormField
            control={form.control}
            name="delegateStatement"
            render={({ field }) => (
              <Textarea
                className="mt-2 min-h-[16rem]"
                onFocus={addDefaultValueOnFocus}
                placeholder={defaultValue}
                {...field}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="preview">
          <Markdown content={delegateStatement} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
