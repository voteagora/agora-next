import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegateStatement/delegateStatement";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";

export default function TopIssues({
  statement,
}: {
  statement: DelegateStatementType;
}) {
  const { ui } = Tenant.current();

  const topIssues = (
    statement.payload as {
      topIssues: {
        value: string;
        type: string;
      }[];
    }
  ).topIssues;

  if (topIssues.length === 0 || !ui.topGovernanceIssues) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Top Issues</h2>

      <div className="flex flex-col gap-4">
        {topIssues.map((issue, idx) => {
          const issueDefinition = ui.topGovernanceIssues!.find(
            (needle) => issue.type === needle.key
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
              title={issue.value}
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
    <div className="rounded-xl border border-gray-eb shadow-newDefault bg-white p-3">
      <div className="flex flex-row gap-4 items-start">
        <div className="flex flex-col justify-center shrink-0">
          <div className="flex flex-col p-3 rounded-lg shadow-newDefault border border-gray-eb">
            <Image src={icons[icon]} alt={title} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs font-medium text-[#66676b]">{title}</div>
          <div>{value}</div>
        </div>
      </div>
    </div>
  );
};
