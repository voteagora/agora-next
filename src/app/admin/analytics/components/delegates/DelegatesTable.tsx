import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DelegatesTable = ({
  delegates,
}: {
  delegates: { matches: number; misses: number }[];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-secondary bg-wash">
            Group
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
        {delegates.map(
          (delegate: { matches: number; misses: number }, index: number) => (
            <TableRow key={index}>
              <TableCell
                className={`pr-1 text-base text-secondary ${
                  index === delegates.length - 1 && "rounded-bl-xl"
                }`}
              >
                {index + 1}
              </TableCell>
              <TableCell className="px-1 text-base text-primary">
                {delegate.matches}
              </TableCell>
              <TableCell
                className={`px-1 ${index === delegates.length - 1 && "rounded-br-xl"}`}
              >
                {delegate.misses}
              </TableCell>
              <TableCell className="px-1 text-base text-primary">
                {(
                  (Number(delegate.matches) /
                    (Number(delegate.matches) + Number(delegate.misses))) *
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

export default DelegatesTable;
