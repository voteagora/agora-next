import Markdown from "@/components/shared/Markdown/Markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { FormEvent } from "react";

export default function DelegateStatementFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const delegateStatement = useWatch({ name: "delegateStatement" });
  const { ui } = Tenant.current();

  const templateLink = ui.link("delegate-statement-template");

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
    <div className="flex flex-col p-6 text-primary">
      <Tabs defaultValue="write">
        <div className="flex flex-row gap-4 justify-between items-center">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-2xl font-bold text-primary">
              Delegate statement
            </h3>
            {templateLink && (
              <a href={templateLink.url} rel="noreferrer" target="_blank">
                <p className="text-sm opacity-50">{templateLink.title}</p>
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
        <TabsContent value="write" className="mt-6">
          <FormField
            control={form.control}
            name="delegateStatement"
            render={({ field }) => (
              <Textarea
                className="min-h-[16rem]"
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
