import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegateStatement/delegateStatement";
import { icons } from "@/icons/icons";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  statement: DelegateStatementType;
}

export default function TopIssues({ statement }: Props) {
  const { ui } = Tenant.current();
  const topIssues = (
    statement.payload as {
      topIssues: {
        value: string;
        type: string;
      }[];
    }
  ).topIssues;

  if (topIssues.length === 0 || !ui.governanceIssues) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-primary">Top Issues</h2>

      <div className="flex flex-col gap-4">
        {topIssues.map((issue, idx) => {
          const issueDefinition = ui.governanceIssues!.find(
            (def) => issue.type === def.key
          );

          return issueDefinition ? (
            <Issue
              key={idx}
              value={issue.value}
              title={issueDefinition.title}
              icon={issueDefinition.icon}
            />
          ) : (
            <Issue
              key={idx}
              value={issue.value}
              title={issue.type}
              icon={"ballot"}
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
}

const Issue = ({ title, icon, value }: IssueProps) => {
  return (
    <div className="rounded-xl border border-line shadow-newDefault bg-white p-3">
      <div className="flex flex-row gap-4 items-start">
        <div className="flex flex-col justify-center shrink-0">
          <div className="flex flex-col p-3 rounded-lg shadow-newDefault border border-line">
            <Image src={icons[icon]} alt={title} height={16} width={16} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs font-medium text-secondary">{title}</div>
          <div>{value}</div>
        </div>
      </div>
    </div>
  );
};
