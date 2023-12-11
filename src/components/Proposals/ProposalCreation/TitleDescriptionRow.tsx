"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import { Form } from "./CreateProposalForm";
import * as theme from "@/styles/theme";
import { css, cx } from "@emotion/css";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import styles from "./styles.module.scss";
import InputBox from "@/components/shared/InputBox";
import Markdown from "@/components/shared/Markdown/Markdown";

export const tipTextStyle = styles.title_desc_row__tip_text;

type DisplayMode = "write" | "preview";

const displayModeSelectorStyles = styles.title_desc_row__display_mode_selector;

const displayModeSelectorSelectedStyles =
  styles.title_desc_row__display_mode_selector_selected;

export default function TitleDescriptionRow({ form }: { form: Form }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("write");
  return (
    <VStack className={styles.title_desc_row__mt}>
      <h4 className={styles.create_prop_form__heading}>Title</h4>
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
        <h4
          className={cx(
            styles.create_prop_form__heading,
            styles.title_desc_row__mt
          )}
        >
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
          className={styles.title_desc_row__textarea}
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
