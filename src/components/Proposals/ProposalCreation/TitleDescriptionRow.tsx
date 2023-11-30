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

export const tipTextStyle = css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.gray["800"]};
`;

type DisplayMode = "write" | "preview";

const displayModeSelectorStyles = css`
  cursor: pointer;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.gray["600"]};
  padding: ${theme.spacing["1"]} ${theme.spacing["3"]};
  border-radius: ${theme.borderRadius.full};

  :hover {
    background: ${theme.colors.gray["100"]};
    color: ${theme.colors.gray["900"]};
  }
`;

const displayModeSelectorSelectedStyles = css`
  background: ${theme.colors.gray.eb};
  color: ${theme.colors.gray["900"]};
  border-radius: ${theme.borderRadius.full};

  :hover {
    background: ${theme.colors.gray.eb};
  }
`;

export default function TitleDescriptionRow({ form }: { form: Form }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("write");
  return (
    <VStack
      className={css`
        margin-top: ${theme.spacing["4"]};
      `}
    >
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
            css`
              margin-top: ${theme.spacing["4"]};
            `
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
              <Tab
                className={css`
                  outline: none;
                `}
              >
                {({ selected }) => (
                  <div
                    className={css`
                      ${displayModeSelectorStyles}
                      ${selected && displayModeSelectorSelectedStyles}
                    `}
                  >
                    Write
                  </div>
                )}
              </Tab>

              <Tab
                className={css`
                  outline: none;
                `}
              >
                {({ selected }) => (
                  <div
                    className={css`
                      ${displayModeSelectorStyles}
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
          className={css`
            background: ${theme.colors.gray.fa};
            padding: ${theme.spacing["4"]};
            margin-top: ${theme.spacing["2"]};
            border-radius: ${theme.borderRadius.md};
            outline: none;
            width: 100%;
            min-height: ${theme.spacing["64"]};
            border-width: ${theme.spacing.px};
            border-color: ${theme.colors.gray.eb};
          `}
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
