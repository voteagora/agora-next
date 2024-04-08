"use client";

import { Form } from "./CreateProposalForm";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import { Switch } from "@/components/shared/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { disapprovalThreshold } from "@/lib/constants";

function ProposalTypeRow({
  form,
  proposalSettingsList,
}: {
  form: Form;
  proposalSettingsList: any[];
}) {
  const { proposalType, proposalSettings } = form.state;
  const optimisticProposalSettingsIndex = proposalSettingsList.find(
    (item) => item.name === "Optimistic"
  )?.proposal_type_id;
  const infoText = () => {
    switch (proposalType) {
      case "Basic":
        return "A basic proposal is one where voters will be asked to vote for, against, or abstain. The proposal will pass if the abstain and for votes exceeed quorum AND if the for votes exceed the approval threshold.";
      case "Optimistic":
        return `An optimistic vote is one where voters will be asked to vote for, against, or abstain. The proposal will automatically pass unless ${disapprovalThreshold}% vote against. Since no transaction can be proposed for optimistic proposals, it can only be used for social signalling.`;
      case "Approval":
        return "An approval vote is one where voters will be asked to choose among multiple options. If the proposal passes quorum, then options will be approved according to your selected approval criteria.";
    }
  };

  useEffect(() => {
    if (proposalType === "Optimistic") {
      form.onChange.proposalSettings(
        optimisticProposalSettingsIndex.toString()
      );
    } else if (
      proposalSettings === optimisticProposalSettingsIndex?.toString()
    ) {
      form.onChange.proposalSettings("0");
    }
  }, [
    proposalType,
    optimisticProposalSettingsIndex,
    proposalSettings,
    form.onChange,
  ]);

  return (
    <VStack className={styles.type_row}>
      <HStack
        className={styles.type_row__inner}
        justifyContent="justify-between"
        gap={8}
      >
        <div className={styles.type_row__left}>
          <h4 className={styles.input_heading}>Vote type</h4>
          <Switch
            options={["Basic", "Approval", "Optimistic"]}
            selection={proposalType}
            onSelectionChanged={form.onChange.proposalType}
          />
        </div>
        <div className={styles.type_row__right}>
          <h4 className={styles.input_heading}>Proposal type</h4>
          <Select
            value={proposalSettings}
            onValueChange={form.onChange.proposalSettings}
            defaultValue={"0"}
            disabled={proposalType === "Optimistic"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={proposalSettingsList[0].name} />
            </SelectTrigger>
            <SelectContent>
              {proposalSettingsList
                // Show optimistic settings only when optimistic vote type is selected
                .filter(
                  (proposalSettings) =>
                    proposalType === "Optimistic" ||
                    proposalSettings.name != "Optimistic"
                )
                .map((item, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </HStack>
      <div className={styles.type_row__text}>{infoText()}</div>
    </VStack>
  );
}

export default ProposalTypeRow;
