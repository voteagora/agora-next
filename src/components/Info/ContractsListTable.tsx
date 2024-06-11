import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import copyIcon from "@/icons/copy.svg";
import linkIcon from "@/assets/icons/link.svg";

const contracts = [
  {
    contactTitle: "Governor contract",
    contactAddress: "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
    copyIcon: copyIcon,
    linkIcon: linkIcon,
  },
  {
    contactTitle: "Token contract",
    contactAddress: "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
    copyIcon: copyIcon,
    linkIcon: linkIcon,
  },
  {
    contactTitle: "Timelock",
    contactAddress: "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
    copyIcon: copyIcon,
    linkIcon: linkIcon,
  },
];

const ContractsListTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            colSpan={4}
            className="text-base font-semibold text-gray-4f bg-gray-fa"
          >
            Contracts
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract, index) => (
          <TableRow key={index}>
            <TableCell className="pr-1 text-base font-semibold text-gray-4f">
              {contract.contactTitle}
            </TableCell>
            <TableCell className="px-1 text-base font-semibold text-black">
              {contract.contactAddress}
            </TableCell>
            <TableCell className="px-1">
              <Image
                alt="copyIcon"
                width={20}
                height={20}
                src={contract.copyIcon}
              />
            </TableCell>
            <TableCell className="px-1">
              <Image
                alt="linkIcon"
                width={20}
                height={20}
                src={contract.linkIcon}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContractsListTable;
