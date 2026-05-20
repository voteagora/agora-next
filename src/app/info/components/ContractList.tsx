import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import linkIcon from "@/assets/icons/link.svg";
import Tenant from "@/lib/tenant/tenant";
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
            className="font-semibold text-secondary bg-wash rounded-t-lg"
          >
            Contracts
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((contract, index) => (
          <TableRow key={index}>
            <TableCell
              className={`pr-1 font-semibold text-secondary ${
                index === list.length - 1 && "rounded-bl-lg"
              }`}
            >
              {contract.title}
            </TableCell>
            <TableCell className="px-1 text-base font-semibold text-primary">
              {contract.address}
            </TableCell>
            <TableCell
              className={`px-1 ${index === list.length - 1 && "rounded-br-lg"}`}
            >
              <a
                href={getBlockScanAddress(contract.address)}
                target="_blank"
                rel="noreferrer noopener"
              >
                <img
                  alt={contract.title}
                  width={20}
                  height={20}
                  src={linkIcon as string}
                />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContractList;
