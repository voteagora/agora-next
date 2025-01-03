import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VotesTable = ({ votes }: { votes: any }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-secondary bg-wash">
            Proposal ID
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Total Votes
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Votes on Agora
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary bg-wash mx-0 px-0">
            Percent on Agora
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {votes.map((vote: any, index: any) => (
          <TableRow key={index}>
            <TableCell
              className={`pr-1 text-base text-secondary ${
                index === votes.length - 1 && "rounded-bl-xl"
              }`}
            >
              {vote.proposal_id}
            </TableCell>
            <TableCell className="px-1 text-base text-primary">
              {vote.vote_count}
            </TableCell>
            <TableCell
              className={`px-1 ${index === votes.length - 1 && "rounded-br-xl"}`}
            >
              {vote.event_count}
            </TableCell>
            <TableCell className="px-1 text-base text-primary">
              {(
                (Number(vote.event_count) / Number(vote.vote_count)) *
                100
              ).toFixed(2)}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VotesTable;
