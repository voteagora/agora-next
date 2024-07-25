import Markdown from "@/components/shared/Markdown/Markdown";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function DelegateStatementFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const delegateStatement = useWatch({ name: "delegateStatement" });
  const { namespace } = Tenant.current();

  const showTemplate = namespace === TENANT_NAMESPACES.OPTIMISM;

  return (
    <VStack className="py-8 px-6 border-b border-line">
      <Tabs defaultValue="write">
        <HStack className="gap-4 justify-between items-baseline">
          <HStack className="items-baseline gap-2">
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
          </HStack>
          <TabsList className="gap-0">
            <TabsTrigger variant="gray" className="text-sm" value="write">
              Write
            </TabsTrigger>
            <TabsTrigger variant="gray" className="text-sm" value="preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </HStack>
        <TabsContent value="write">
          <FormField
            control={form.control}
            name="delegateStatement"
            render={({ field }) => (
              <Textarea
                className="mt-2 min-h-[16rem]"
                placeholder={`A brief intro to yourself:

A message to the community and ecosystem:

Discourse username:`}
                {...field}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="preview">
          <Markdown content={delegateStatement} />
        </TabsContent>
      </Tabs>
    </VStack>
  );
}
