import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/shared/CloseIcon";
import { issueDefinitions } from "@/lib/issueDefinitions";

export type IssueState = {
  type: string;
  value: string;
};

function initialIssueState(type: string): IssueState {
  return {
    type,
    value: "",
  };
}

export function initialTopIssues(): IssueState[] {
  return [initialIssueState("treasury"), initialIssueState("funding")];
}

export default function TopIssuesFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
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
            {issueDefinitions.map((issue) => (
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

      <VStack className="gap-4 mt-6">
        {topIssues.map((issue: IssueState, index: number) => {
          const issueDef = issueDefinitions.find(
            (needle) => issue.type === needle.key
          )!;

          return (
            <HStack
              className="gap-4 items-center"
              key={issue.type + index.toString()}
            >
              <div className="flex justify-center items-center w-12 h-12 min-w-12 bg-white rounded-md border border-gray-300 shadow-newDefault p-2">
                <Image src={icons[issueDef.icon]} alt={issueDef.title} />
              </div>

              <VStack className="flex-1 relative">
                <VStack className="absolute right-0 top-0 bottom-0">
                  <Button variant="ghost" onClick={() => removeIssue(index)}>
                    <CloseIcon className="w-4 h-4 my-[0.8rem] text-muted-foreground" />
                  </Button>
                </VStack>
                <Input
                  className="pr-12"
                  variant="bgGray100"
                  inputSize="md"
                  type="text"
                  placeholder={`On ${issueDef.title.toLowerCase()}, I believe...`}
                  value={issue.value}
                  onChange={(e) => updateIssue(index, e.target.value)}
                />
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </div>
  );
}
