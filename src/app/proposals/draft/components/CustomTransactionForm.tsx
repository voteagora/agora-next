import { z } from "zod";
import { useFormContext } from "react-hook-form";
import {
  BasicProposalSchema,
  ApprovalProposalSchema,
} from "./../schemas/DraftProposalSchema";
import { TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { TransactionBuilder } from "@/components/TransactionBuilder/TransactionBuilder";

// example calldata
// 0xa9059cbb00000000000000000000000065a3870f48b5237f27f674ec42ea1e017e111d630000000000000000000000000000000000000000000000000000000000000064
const CustomTransactionForm = ({
  index,
  name,
}: {
  index: number;
  name: "transactions" | `approvalProposal.options.${number}.transactions`;
}) => {
  return <TransactionBuilder index={index} name={name} />;
};

export default CustomTransactionForm;
