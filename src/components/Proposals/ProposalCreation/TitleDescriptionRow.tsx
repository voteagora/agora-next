"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import { Form } from "./CreateProposalForm";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import InputBox from "@/components/shared/InputBox";
import Markdown from "@/components/shared/Markdown/Markdown";

export const tipTextStyle = "text-sm text-secondary";

type DisplayMode = "write" | "preview";

const displayModeSelectorStyles =
  "cursor-pointer text-sm font-medium text-tertiary py-1 px-3 rounded-full hover:bg-wash hover:text-primary";

const displayModeSelectorSelectedStyles = "bg-wash text-primary rounded-full";

export default function TitleDescriptionRow({ form }: { form: Form }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("write");
  return (
    <VStack className="mt-4">
      <h4 className="text-xs font-semibold mb-1 text-secondary">Title</h4>
      <InputBox
        placeholder={"I'd like to propose..."}
        value={form.state.title}
        onChange={(next) => form.onChange.title(next)}
        required
      />
      <HStack
        alignItems="items-baseline"
        justifyContent="justify-between"
        gap={4}
      >
        <h4 className="text-xs font-semibold mb-1 text-secondary mt-4">
          Proposal
        </h4>

        <Tab.Group
          manual
          selectedIndex={(() => {
            switch (displayMode) {
              case "preview":
                return 1;

              case "write":
                return 0;
            }
          })()}
          onChange={(index) => {
            switch (index) {
              case 0:
                setDisplayMode("write");
                return;

              case 1:
                setDisplayMode("preview");
                return;
            }
          }}
        >
          <Tab.List>
            <HStack gap={1}>
              <Tab className="outline-none">
                {({ selected }) => (
                  <div
                    className={`
                      ${displayModeSelectorStyles}${" "}
                      ${selected && displayModeSelectorSelectedStyles}
                    `}
                  >
                    Write
                  </div>
                )}
              </Tab>

              <Tab className="outline-none">
                {({ selected }) => (
                  <div
                    className={`
                      ${displayModeSelectorStyles}${" "}
                      ${selected && displayModeSelectorSelectedStyles}
                    `}
                  >
                    Preview
                  </div>
                )}
              </Tab>
            </HStack>
          </Tab.List>
        </Tab.Group>
      </HStack>

      {displayMode === "write" && (
        <textarea
          className="text-tertiary p-4 mt-2 rounded-md outline-none w-full min-h-[16rem] border border-line"
          value={form.state.description}
          onChange={(e) => form.onChange.description(e.target.value)}
          placeholder="I’m a proposal body, and I like markdown formatting..."
          required
        />
      )}

      {displayMode === "preview" && (
        <Markdown content={form.state.description} />
      )}
    </VStack>
  );
}
