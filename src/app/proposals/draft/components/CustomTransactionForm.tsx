import { z } from "zod";
import TextInput from "./form/TextInput";
import AddressInput from "./form/AddressInput";
import { useFormContext } from "react-hook-form";
import {
  BasicProposalSchema,
  ApprovalProposalSchema,
} from "./../schemas/DraftProposalSchema";
import { TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

// example calldata
// 0xa9059cbb00000000000000000000000065a3870f48b5237f27f674ec42ea1e017e111d630000000000000000000000000000000000000000000000000000000000000064
const CustomTransactionForm = ({
  index,
  name,
}: {
  index: number;
  name: "transactions" | `approvalProposal.options.${number}.transactions`;
}) => {
  type FormType =
    | z.output<typeof BasicProposalSchema>
    | z.output<typeof ApprovalProposalSchema>;

  const { control } = useFormContext<FormType>();
  const { namespace } = Tenant.current();

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2">
        <AddressInput
          control={control}
          label="Target"
          name={`${name}.${index}.target`}
        />
      </div>

      <TextInput
        label="Value"
        name={`${name}.${index}.value`}
        control={control}
        placeholder="100"
      />
      {/* Uni requires function signature */}
      {namespace === TENANT_NAMESPACES.UNISWAP && (
        <div className="col-span-3">
          <TextInput
            label="Signature"
            name={`${name}.${index}.signature`}
            control={control}
            placeholder="Example: transfer(address,uint256)"
          />
        </div>
      )}
      <div className="col-span-3">
        <TextInput
          label="Calldata"
          name={`${name}.${index}.calldata`}
          control={control}
          placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
        />
      </div>
      <div className="col-span-3">
        <TextInput
          label="Description"
          name={`${name}.${index}.description`}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>
    </div>
  );
};

export default CustomTransactionForm;
