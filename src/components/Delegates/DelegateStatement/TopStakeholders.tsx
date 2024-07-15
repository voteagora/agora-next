import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegateStatement/delegateStatement";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { capitalizeFirstLetter } from "@/lib/utils";

interface Props {
  statement: DelegateStatementType;
}

export default function TopStakeholders({ statement }: Props) {
  const { ui } = Tenant.current();

  const stakeholders = (
    statement.payload as {
      topStakeholders: {
        value: string;
        type: string;
      }[];
    }
  ).topStakeholders;

  if (
    !stakeholders ||
    stakeholders.length === 0 ||
    !ui.governanceStakeholders
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Represented Stakeholders</h2>

      <div className="flex flex-col gap-4">
        {stakeholders.map((stakeholder, idx) => {
          const definition = ui.governanceStakeholders!.find(
            (def) => stakeholder.type === def.key
          );

          return (
            <Stakeholder
              key={idx}
              title={definition ? definition.title : stakeholder.type}
            />
          );
        })}
      </div>
    </div>
  );
}

interface StakeholderProps {
  title: string;
}

const Stakeholder = ({ title }: StakeholderProps) => {
  return (
    <div className="rounded-xl border border-gray-eb shadow-newDefault bg-white p-3">
      <div className="flex flex-row gap-4 items-start">
        <div className="flex flex-col justify-center shrink-0">
          <div className="flex flex-col p-3 rounded-lg shadow-newDefault border border-gray-eb">
            <Image src={icons.community} alt={title} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs font-medium text-tertiary">I represent</div>
          <div>{capitalizeFirstLetter(title)}s</div>
        </div>
      </div>
    </div>
  );
};
