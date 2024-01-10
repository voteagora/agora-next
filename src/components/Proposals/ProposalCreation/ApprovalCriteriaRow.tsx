"use client";

import { css, cx } from "@emotion/css";
import { Form } from "./CreateProposalForm";
import * as theme from "@/styles/theme";
import styles from "./styles.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import InputBox from "@/components/shared/InputBox";
import { Switch } from "@/components/shared/Switch";
import InfoPop from "@/components/shared/InfoPop";
import LabelWithInfo from "./LabelWithInfo";

export default function ApprovalCriteriaRow({ form }: { form: Form }) {
  return (
    <>
      <h4 className={styles.create_prop_form__title}>Approval parameters</h4>
      <p className={styles.approval__info}>
        Use the following settings to set the parameters of this vote as well as
        the methodology for determining which options can be executed.
      </p>
      <HStack className={styles.approval__section} gap={4}>
        <VStack className="w-full">
          <LabelWithInfo label="Budget (OP)">
            This is the maximum number of tokens that can be transferred from
            all the options in this proposal.
          </LabelWithInfo>
          <InputBox
            placeholder={"30 000 000 OP"}
            value={form.state.budget}
            onChange={(next) => form.onChange.budget(next)}
            required
            type="number"
            min={0}
          />
        </VStack>
        <VStack className="w-full">
          <LabelWithInfo label="Max options">
            Determines up to how many options each voter may select
          </LabelWithInfo>
          <InputBox
            placeholder={"Min. 1"}
            value={form.state.maxOptions}
            type="number"
            onChange={(next) => form.onChange.maxOptions(next)}
            required
            min={1}
          />
        </VStack>
      </HStack>
      <HStack className={styles.approval__section} gap={4}>
        <VStack className="w-full">
          <LabelWithInfo label="Criteria">
            There are two ways to determine the winners of an approval vote.
            <br />
            <br />
            Using Threshold means all options with more than a set amount of
            votes win.
            <br />
            <br />
            Using Top Choices means only a set number of the most popular
            options win.
          </LabelWithInfo>
          <Switch
            options={["Threshold", "Top Choices"]}
            selection={form.state.criteriaType}
            onSelectionChanged={form.onChange.criteriaType}
          />
        </VStack>
        {form.state.criteriaType === "Threshold" ? (
          <VStack className="w-full">
            <LabelWithInfo label="Threshold">
              Selects how many votes an option must have to be considered a
              winner
            </LabelWithInfo>
            <InputBox
              placeholder={"3 000 000 OP"}
              value={form.state.threshold}
              type="number"
              onChange={(next) => form.onChange.threshold(next)}
              required
              min={0}
            />
          </VStack>
        ) : (
          <VStack className="w-full">
            <LabelWithInfo label="Top choices">
              Selects how many of the most voted for options win.
            </LabelWithInfo>
            <InputBox
              placeholder={"Min. 1"}
              value={form.state.topChoices}
              type="number"
              onChange={(next) => form.onChange.topChoices(next)}
              required
              min={1}
            />
          </VStack>
        )}
      </HStack>
    </>
  );
}
