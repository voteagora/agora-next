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

const TOP_ISSUES_FORM_FIELD = "topIssues";

type Issue = {
  type: string;
  value: string;
};

interface TopIssuesFormSectionProps {
  form: UseFormReturn<DelegateStatementFormValues>;
}

export default function TopIssuesFormSection({
  form,
}: TopIssuesFormSectionProps) {
  const { ui } = Tenant.current();
  const topIssues = useWatch({ name: TOP_ISSUES_FORM_FIELD });

  const addIssue = (key: string) => {
    const newTopIssues = [...topIssues, { type: key, value: "" }];
    form.setValue(TOP_ISSUES_FORM_FIELD, newTopIssues);
  };

  const removeIssue = (index: number) => {
    const newTopIssues = topIssues.filter(
      (issue: Issue, _index: number) => _index !== index
    );
    form.setValue(TOP_ISSUES_FORM_FIELD, newTopIssues);
  };

  const updateIssue = (index: number, value: string) => {
    const newTopIssues = topIssues.map((issue: Issue, _index: number) => {
      if (_index === index) {
        return {
          ...issue,
          value,
        };
      }
      return issue;
    });
    form.setValue(TOP_ISSUES_FORM_FIELD, newTopIssues);
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
            {ui.governanceIssues!.map((issue) => (
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
        {topIssues.map((issue: Issue, idx: number) => {
          const definition = ui.governanceIssues!.find(
            (def) => issue.type === def.key
          );

          return definition ? (
            <IssueInput
              key={idx}
              title={definition.title}
              icon={definition.icon}
              value={issue.value}
              index={idx}
              removeIssue={removeIssue}
              updateIssue={updateIssue}
            />
          ) : (
            <IssueInput
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

interface IssueInputProps {
  title: string;
  icon: keyof typeof icons;
  value: string;
  index: number;
  removeIssue: (index: number) => void;
  updateIssue: (index: number, value: string) => void;
}

const IssueInput = ({
  icon,
  title,
  value,
  index,
  removeIssue,
  updateIssue,
}: IssueInputProps) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="flex justify-center items-center w-12 h-12 min-w-12 bg-white rounded-md border border-gray-300 shadow-newDefault p-2">
        <Image src={icons[icon]} alt={title} />
      </div>

      <div className="flex flex-col flex-1 relative">
        <div className="flex flex-col absolute right-0 top-0 bottom-0">
          <Button
            variant="ghost"
            className="mt-[2px] mr-[3px]"
            onClick={() => removeIssue(index)}
          >
            <CloseIcon className="w-4 h-4 mx-1 my-[1px] text-muted-foreground" />
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
