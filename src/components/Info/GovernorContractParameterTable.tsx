import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const parameters = [
  {
    parameterTitle: "Voting delay",
    parameterAddress: "0 days, 0 hours",
  },
  {
    parameterTitle: "Voting period",
    parameterAddress: "6 days, 0 hours",
  },
];

const GovernorContractParameterTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-left text-gray-4f bg-gray-fa">
            Parameter
          </TableHead>
          <TableHead className="text-base font-semibold text-gray-4f text-right bg-gray-fa">
            Value
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((parameter, index) => (
          <TableRow key={index}>
            <TableCell className="text-base font-semibold text-left text-gray-4f">
              {parameter.parameterTitle}
            </TableCell>
            <TableCell className="text-base font-semibold text-right text-black">
              {parameter.parameterAddress}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GovernorContractParameterTable;
