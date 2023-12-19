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

function ProposalTypeRow({
  form,
  proposalSettingsList,
}: {
  form: Form;
  proposalSettingsList: any[];
}) {
  const { proposalType, proposalSettings } = form.state;
  const infoText =
    proposalType === "Basic"
      ? "A basic proposal is one where voters will be asked to vote for, against, or abstain. The proposal will pass if the abstain and for votes exceeed quorum AND if the for votes exceed the approval threshold."
      : "An approval vote is one where voters will be asked to choose among multiple options. If the proposal passes quorum, then options will be approved according to your selected approval criteria.";
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
            options={["Basic", "Approval"]}
            selection={proposalType}
            onSelectionChanged={form.onChange.proposalType}
          />
        </div>
        <div className={styles.type_row__right}>
          <h4 className={styles.input_heading}>Proposal type</h4>
          <Select
            onValueChange={form.onChange.proposalSettings}
            defaultValue={"0"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={proposalSettingsList[0].name} />
            </SelectTrigger>
            <SelectContent>
              {proposalSettingsList.map((item, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </HStack>
      <div className={styles.type_row__text}>{infoText}</div>
    </VStack>
  );
}

export default ProposalTypeRow;
