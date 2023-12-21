import Markdown from "@/components/shared/Markdown/Markdown";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DelegateStatementFormSection({ form }) {
  return (
    <VStack className="py-8 px-6 border-b border-gray-300">
      <Tabs defaultValue="write">
        <HStack className="gap-4 justify-between items-baseline">
          <HStack className="items-baseline gap-2">
            <h3 className="font-bold">Delegate statement</h3>
            <a
              href="https://gov.optimism.io/t/delegate-commitments/235"
              rel="noreferrer"
              target="_blank"
            >
              <p className="text-sm opacity-50">View template</p>
            </a>
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
          <textarea
            className="bg-gray-100 p-4 mt-2 rounded-md outline-none w-full min-h-[16rem] border border-gray-300"
            // value={form.state.delegateStatement}
            // onChange={(e) => form.onChange.delegateStatement(e.target.value)}
            placeholder="I believe that..."
          />
        </TabsContent>
        <TabsContent value="preview">
          {/* TODO: frh -> this with form */}
          {/* <Markdown content={form.state.delegateStatement} /> */}
          <Markdown content="hi pluto" />
        </TabsContent>
      </Tabs>
    </VStack>
  );
}
