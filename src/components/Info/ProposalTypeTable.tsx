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
        <TableRow className="text-base font-semibold text-left text-gray-4f bg-gray-fa">
          <TableHead colSpan={3}>Proposal type</TableHead>
          <TableHead colSpan={4}>Quorum</TableHead>
          <TableHead colSpan={4}>Approval threshold</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposalType.map((proposal, index) => (
          <TableRow
            className="text-base font-semibold text-gray-4f"
            key={index}
          >
            <TableCell colSpan={3}>{proposal.proposalType}</TableCell>
            <TableCell colSpan={4}>{proposal.quorum}</TableCell>
            <TableCell colSpan={4}>{proposal.approvalThreshold}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProposalTypeTable;
