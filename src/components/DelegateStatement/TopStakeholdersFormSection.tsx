import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import { Input } from "@/components/ui/input";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/shared/CloseIcon";
import Tenant from "@/lib/tenant/tenant";

const TOP_STAKEHOLDERS_FORM_FIELD = "topStakeholders";

type Stakeholder = {
  type: string;
  value: string;
};

interface TopStakeholdersFormSectionProps {
  form: UseFormReturn<DelegateStatementFormValues>;
}

export default function TopStakeholdersFormSection({
  form,
}: TopStakeholdersFormSectionProps) {
  const { ui } = Tenant.current();
  const topStakeholders = useWatch({ name: TOP_STAKEHOLDERS_FORM_FIELD });
  const canAddMoreStakeholders = topStakeholders.length === 0;

  const addIssue = (key: string) => {
    const newStakeholder = [
      ...topStakeholders,
      {
        type: key,
        value: `I represent ${key.toLowerCase()}s`,
      },
    ];
    form.setValue(TOP_STAKEHOLDERS_FORM_FIELD, newStakeholder);
  };

  const removeIssue = (index: number) => {
    const newTopIssues = topStakeholders.filter(
      (issue: Stakeholder, idx: number) => idx !== index
    );
    form.setValue(TOP_STAKEHOLDERS_FORM_FIELD, newTopIssues);
  };

  return (
    <div className="py-8 px-6 border-b border-gray-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <h3 className="font-bold">Stakeholders I represent</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`${canAddMoreStakeholders ? "text-[#66676b]" : "text-gray-500"} outline-none`}
            disabled={!canAddMoreStakeholders}
          >
            + Add a stakeholder
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ui.governanceStakeholders!.map((issue) => (
              <DropdownMenuItem
                key={issue.title}
                onClick={() => addIssue(issue.key)}
              >
                {issue.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-sm">
        Use this tag to identify what stakeholder group you are, or look to
        represent in your votes.
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {topStakeholders.map((issue: Stakeholder, idx: number) => {
          const definition = ui.governanceStakeholders!.find(
            (def) => issue.type === def.key
          );

          return definition ? (
            <StakeholderInput
              key={idx}
              title={`${definition.title.toLowerCase()}s`}
              value={`${definition.title.toLowerCase()}s`}
              index={idx}
              remove={removeIssue}
            />
          ) : (
            <StakeholderInput
              key={idx}
              title={issue.type}
              value={issue.value}
              index={idx}
              remove={removeIssue}
            />
          );
        })}
      </div>
    </div>
  );
}

interface StakeholderInputProps {
  title: string;
  value: string;
  index: number;
  remove: (index: number) => void;
}

const StakeholderInput = ({
  title,
  value,
  index,
  remove,
}: StakeholderInputProps) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="flex justify-center items-center w-12 h-12 min-w-12 bg-white rounded-md border border-gray-300 shadow-newDefault p-2">
        <Image src={icons.community} alt="Stakeholders" />
      </div>

      <div className="flex flex-col flex-1 relative">
        <div className="flex flex-col absolute right-0 top-0 bottom-0">
          <Button
            variant="ghost"
            className="mt-[2px] mr-[3px]"
            onClick={() => remove(index)}
          >
            <CloseIcon className="w-4 h-4 mx-1 my-[1px] text-muted-foreground" />
          </Button>
        </div>
        <Input
          className="pr-12"
          variant="bgGray100"
          inputSize="md"
          type="text"
          placeholder={`I represent ${value}`}
          value={`I represent ${value}`}
        />
      </div>
    </div>
  );
};
