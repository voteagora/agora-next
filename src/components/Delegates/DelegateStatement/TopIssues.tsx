import { type DelegateStatement as DelegateStatementType } from "@/app/api/delegateStatement/delegateStatement";
import { VStack, HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import { issueDefinitions } from "@/lib/issueDefinitions";

export default function TopIssues({
  statement,
}: {
  statement: DelegateStatementType;
}) {
  const topIssues = (
    statement.payload as {
      topIssues: {
        value: string;
        type: string;
      }[];
    }
  ).topIssues;

  if (topIssues.length === 0) {
    return null;
  }

  return (
    <VStack className="gap-4">
      <h2 className="text-2xl font-bold">Top Issues</h2>

      <VStack className="gap-4">
        {topIssues.map((issue, index) => {
          const issueDef = issueDefinitions.find(
            (needle) => issue.type === needle.key
          )!;

          return (
            <div
              key={index}
              className="rounded-xl border border-gray-eb shadow-newDefault bg-white p-3"
            >
              <HStack className="gap-4 items-start">
                <VStack className="justify-center shrink-0">
                  <VStack className="p-3 rounded-lg shadow-newDefault border border-gray-eb">
                    <Image src={icons[issueDef.icon]} alt={issueDef.title} />
                  </VStack>
                </VStack>

                <VStack>
                  <div className="text-xs font-medium text-[#66676b]">
                    {issueDef.title}
                  </div>
                  <div>{issue.value}</div>
                </VStack>
              </HStack>
            </div>
          );
        })}
      </VStack>
    </VStack>
  );
}
