// Simple markdown editor with tabs to switch between write and preview mode

import React, { useState } from "react";
import Markdown from "./Markdown";
import { HStack, VStack } from "../../Layout/Stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder: string;
  templateUrl?: string;
  disabled?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  title,
  placeholder,
  templateUrl,
  disabled,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState("write");

  return (
    <VStack className="py-8 px-6 border-b border-gray-300">
      <Tabs value={tab} onValueChange={setTab}>
        <HStack className="gap-4 justify-between items-baseline">
          <HStack className="items-baseline gap-2">
            <h3 className="font-bold">{title}</h3>
            {templateUrl && (
              <a href={templateUrl} rel="noreferrer" target="_blank">
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
          <Textarea
            className="mt-2 min-h-[16rem]"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </TabsContent>
        <TabsContent value="preview">
          <Markdown content={value} />
        </TabsContent>
      </Tabs>
    </VStack>
  );
}
