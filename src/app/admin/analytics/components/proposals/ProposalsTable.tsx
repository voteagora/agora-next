import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProposalsTable = ({
  proposals,
}: {
  proposals: { matches: number; misses: number }[];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-secondary bg-wash">
            Batch (1000 blocks)
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Matches
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Misses
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Percent on Agora
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map(
          (proposal: { matches: number; misses: number }, index: number) => (
            <TableRow key={index}>
              <TableCell
                className={`pr-1 text-base text-secondary ${
                  index === proposals.length - 1 && "rounded-bl-xl"
                }`}
              >
                {index + 1}
              </TableCell>
              <TableCell className="px-1 text-base text-primary">
                {proposal.matches}
              </TableCell>
              <TableCell
                className={`px-1 ${index === proposals.length - 1 && "rounded-br-xl"}`}
              >
                {proposal.misses}
              </TableCell>
              <TableCell className="px-1 text-base text-primary">
                {(
                  (Number(proposal.matches) /
                    (Number(proposal.matches) + Number(proposal.misses))) *
                  100
                ).toFixed(2)}
                %
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};

export default ProposalsTable;
