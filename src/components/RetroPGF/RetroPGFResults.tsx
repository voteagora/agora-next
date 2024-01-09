import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import profile from "@/icons/profile.svg";
import Image from "next/image";

export type Results = {
  node: {
    id: string;
    impactCategory: string[];
    displayName: string;
    includedInBallots: number;
  };
}[];

export default function RetroPGFResults({ results }: { results: Results }) {
  return (
    <Table>
      <TableHeader className="border-none">
        <TableRow className="border-none">
          <TableHead className="text-xs" variant="gray">
            Project
          </TableHead>
          <TableHead className="text-xs" variant="gray">
            Submitted by
          </TableHead>
          <TableHead className="text-xs" variant="gray">
            Categories
          </TableHead>
          <TableHead className="text-xs text-right" variant="gray">
            In ballots
          </TableHead>
          <TableHead className="text-xs text-right" variant="gray">
            In lists
          </TableHead>
          <TableHead className="text-xs text-right" variant="gray">
            Amount received
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-gray-4f font-medium text-base">
        {results.map((result) => {
          const { id, displayName, includedInBallots, impactCategory } =
            result.node;
          const _profile = "solidity.lang.eth";
          return (
            <TableRow className="border-none" key={id}>
              <TableCell className="font-semibold text-black">
                {displayName}
              </TableCell>
              <TableCell className="flex gap-2 items-center">
                <Image src={profile} alt={_profile} className="h-5" />
                <span>{_profile}</span>
              </TableCell>
              <TableCell>
                {impactCategory.map((category) => (
                  <span
                    className="mx-1 py-0.5 px-1 rounded-[4px] bg-gray-fa text-xs"
                    key={category}
                  >
                    End UX & Adoption
                  </span>
                ))}
              </TableCell>
              <TableCell className="text-right">{includedInBallots}</TableCell>
              <TableCell className="text-right">14</TableCell>
              <TableCell className="text-right flex justify-end gap-2 items-center">
                <span className="font-semibold text-black">500,000 OP</span>
                <span className="text-xs">(2,42%)</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
