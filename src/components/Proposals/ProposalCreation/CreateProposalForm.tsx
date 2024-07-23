"use client";

import { useRef } from "react";
import { UseForm, useForm } from "@/app/lib/hooks/useForm";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalTypeRow from "./ProposalTypeRow";
import TitleDescriptionRow from "./TitleDescriptionRow";
import ApprovalCriteriaRow from "./ApprovalCriteriaRow";
import ApprovalOptionsRow from "./ApprovalOptionsRow";
import StandardForm from "./StandardForm";
import SubmitButton from "./SubmitButton";

type FormValues = {
  proposalType: "Basic" | "Approval" | "Optimistic";
  proposalSettings: string;
  title: string;
  description: string;
  budget: number;
  maxOptions: number;
  criteriaType: "Threshold" | "Top Choices";
  threshold: number;
  topChoices: number;
  options: Option[];
};

type Option = {
  title: string;
  transactions: Transaction[];
};

export type Transaction = {
  type: "Transfer" | "Custom";
  target: string;
  value: number;
  calldata: string;
  transferAmount: bigint;
  transferTo: string;
};

export type Form = UseForm<FormValues>;

export default function CreateProposalForm({
  proposalSettingsList,
}: {
  proposalSettingsList: any[];
}) {
  const initialFormValues: FormValues = {
    proposalType: "Basic",
    proposalSettings: "0",
    title: "",
    description: "",
    budget: 0,
    maxOptions: 1,
    criteriaType: "Threshold",
    threshold: 0,
    topChoices: 1,
    options: [{ title: "", transactions: [] }],
  };
  const form = useForm<FormValues>(() => initialFormValues);
  const formTarget = useRef<HTMLFormElement>(null);

  return (
    <VStack className="w-full">
      <form ref={formTarget}>
        <VStack className="bg-neutral rounded-xl border border-line shadow-newDefault">
          <div className="p-8 border-b border-line">
            <h1 className="text-2xl font-extrabold pb-1 text-primary">
              Create proposal
            </h1>
            <p className="text-secondary">
              Select the type of vote and proposal you want to create, and
              describe its intent to voters. Remember to proofread as proposals
              cannot be edited once published.
            </p>
            <ProposalTypeRow
              form={form}
              proposalSettingsList={proposalSettingsList}
            />
            <TitleDescriptionRow form={form} />
          </div>
          {form.state.proposalType === "Approval" && (
            <>
              <div className="p-8 border-b border-line">
                <ApprovalCriteriaRow form={form} />
              </div>
              <div className="p-8 border-b border-line">
                <ApprovalOptionsRow form={form} />
              </div>
            </>
          )}
          {form.state.proposalType === "Basic" && (
            <div className="p-8 border-b border-line">
              <StandardForm form={form} />
            </div>
          )}
          <HStack
            justifyContent="justify-between"
            alignItems="items-center"
            className="p-8"
          >
            <SubmitButton formTarget={formTarget} form={form} />
          </HStack>
        </VStack>
      </form>
    </VStack>
  );
}
