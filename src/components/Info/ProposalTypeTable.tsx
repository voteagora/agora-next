import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const proposalType = [
  {
    proposalType: " Default",
    quorum: "30%",
    approvalThreshold: "51%",
  },
  {
    proposalType: " Supermajority",
    quorum: "30%",
    approvalThreshold: "61%",
  },
];

const ProposalTypeTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            colSpan={3}
            className="text-base font-semibold text-left text-gray-4f bg-gray-fa"
          >
            Proposal type
          </TableHead>
          <TableHead
            colSpan={4}
            className="text-base font-semibold text-left text-gray-4f bg-gray-fa"
          >
            Quorum
          </TableHead>
          <TableHead className="text-base font-semibold text-left text-gray-4f bg-gray-fa">
            Approval threshold
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposalType.map((proposal, index) => (
          <TableRow key={index}>
            <TableCell
              colSpan={3}
              className="pr-1 text-base font-semibold text-gray-4f"
            >
              {proposal.proposalType}
            </TableCell>
            <TableCell
              colSpan={4}
              className="px-1 text-base text-left font-semibold text-gray-4f"
            >
              {proposal.quorum}
            </TableCell>
            <TableCell className="px-1 text-base font-semibold text-left text-gray-4f">
              {proposal.approvalThreshold}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProposalTypeTable;
