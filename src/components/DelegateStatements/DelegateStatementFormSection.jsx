"use client";

import { useState } from "react";
// import { Markdown } from "../../components/Markdown";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DelegateStatementFormSection({ form }) {
  const [displayMode, setDisplayMode] = useState("write");

  return (
    <VStack className="py-8 px-6 border-b border-gray-300">
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
        <Tabs defaultValue="write">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          {/* TODO: frh tabs */}
          <TabsContent value="write">
            Make changes to your write here.
          </TabsContent>
          <TabsContent value="preview">Change your preview here.</TabsContent>
        </Tabs>
      </HStack>

      {displayMode === "write" && (
        <textarea
          className="bg-gray-100 p-4 mt-2 rounded-md outline-none w-full min-h-64 border border-gray-300"
          // value={form.state.delegateStatement}
          // onChange={(e) => form.onChange.delegateStatement(e.target.value)}
          placeholder="I believe that..."
        />
      )}

      {/* TODO: frh -> markdown */}
      {/* {displayMode === "preview" && (
        <Markdown markdown={form.state.delegateStatement} />
      )} */}
    </VStack>
  );
}
