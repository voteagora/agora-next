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

type IssueState = {
  type: string;
  value: string;
};

function initialIssueState(type: string): IssueState {
  return {
    type,
    value: "",
  };
}

interface TopIssuesFormSectionProps {
  form: UseFormReturn<DelegateStatementFormValues>;
}

export default function TopIssuesFormSection({
  form,
}: TopIssuesFormSectionProps) {
  const { ui } = Tenant.current();
  const topIssues = useWatch({ name: "topIssues" });

  const addIssue = (key: string) => {
    const newTopIssues = [...topIssues, initialIssueState(key)];
    form.setValue("topIssues", newTopIssues);
  };

  const removeIssue = (index: number) => {
    const newTopIssues = topIssues.filter(
      (issue: IssueState, _index: number) => _index !== index
    );
    form.setValue("topIssues", newTopIssues);
  };

  const updateIssue = (index: number, value: string) => {
    const newTopIssues = topIssues.map((issue: IssueState, _index: number) => {
      if (_index === index) {
        return {
          ...issue,
          value,
        };
      }
      return issue;
    });
    form.setValue("topIssues", newTopIssues);
  };

  return (
    <div className="py-8 px-6 border-b border-gray-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <h3 className="font-bold">Views on top issues</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-[#66676b] outline-none">
            + Add a new issue
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ui.topGovernanceIssues!.map((issue) => (
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

      <div className="flex flex-col gap-4 mt-6">
        {topIssues.map((issue: IssueState, idx: number) => {
          const issueDefinition = ui.topGovernanceIssues!.find(
            (def) => issue.type === def.key
          );

          return issueDefinition ? (
            <Issue
              key={idx}
              title={issueDefinition.title}
              icon={issueDefinition.icon}
              value={issue.value}
              index={idx}
              removeIssue={removeIssue}
              updateIssue={updateIssue}
            />
          ) : (
            <Issue
              key={idx}
              title={issue.value}
              icon={"ballot"}
              value={issue.value}
              index={idx}
              removeIssue={removeIssue}
              updateIssue={updateIssue}
            />
          );
        })}
      </div>
    </div>
  );
}

interface IssueProps {
  title: string;
  icon: keyof typeof icons;
  value: string;
  index: number;
  removeIssue: (index: number) => void;
  updateIssue: (index: number, value: string) => void;
}

const Issue = ({
  icon,
  title,
  value,
  index,
  removeIssue,
  updateIssue,
}: IssueProps) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="flex justify-center items-center w-12 h-12 min-w-12 bg-white rounded-md border border-gray-300 shadow-newDefault p-2">
        <Image src={icons[icon]} alt={title} />
      </div>

      <div className="flex flex-col flex-1 relative">
        <div className="flex flex-col absolute right-0 top-0 bottom-0">
          <Button variant="ghost" onClick={() => removeIssue(index)}>
            <CloseIcon className="w-4 h-4 my-[0.8rem] text-muted-foreground" />
          </Button>
        </div>
        <Input
          className="pr-12"
          variant="bgGray100"
          inputSize="md"
          type="text"
          placeholder={`On ${title.toLowerCase()}, I believe...`}
          value={value}
          onChange={(e) => updateIssue(index, e.target.value)}
        />
      </div>
    </div>
  );
};
