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
      ? "This default proposal type lets delegates vote either yes or no"
      : "This proposal type enables vote for multiple options";
  return (
    <VStack className={styles.type_row}>
      <HStack className={styles.type_row__inner}>
        <div className={styles.type_row__left}>
          <h4 className={styles.create_prop_form__heading}>Vote type</h4>
          <Switch
            options={["Basic", "Approval"]}
            selection={proposalType}
            onSelectionChanged={form.onChange.proposalType}
          />
          <p className={styles.type_row__text}>{infoText}</p>
        </div>
        <div className={styles.type_row__right}>
          <h4 className={styles.create_prop_form__heading}>Proposal type</h4>
          <Select
            onValueChange={form.onChange.proposalSettings}
            defaultValue={"0"}
          >
            <SelectTrigger className="w-[180px]">
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
    </VStack>
  );
}

export default ProposalTypeRow;
