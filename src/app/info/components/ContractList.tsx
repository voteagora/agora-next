import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import linkIcon from "@/assets/icons/link.svg";
import Tenant from "@/lib/tenant/tenant";
import Link from "next/link";
import { getBlockScanAddress } from "@/lib/utils";

const ContractList = () => {
  const { contracts } = Tenant.current();

  const list = [
    {
      title: "Governor",
      address: contracts.governor.address,
    },
    {
      title: "Token",
      address: contracts.token.address,
    },
  ];

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
        {list.map((contract, index) => (
          <TableRow key={index}>
            <TableCell className="pr-1 text-base font-semibold text-gray-4f">
              {contract.title}
            </TableCell>
            <TableCell className="px-1 text-base font-semibold text-black">
              {contract.address}
            </TableCell>
            <TableCell className="px-1">
              <Link
                href={getBlockScanAddress(contract.address)}
                target="_blank"
              >
                <Image
                  alt={contract.title}
                  width={20}
                  height={20}
                  src={linkIcon}
                />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContractList;
