import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import AddressInput from "./form/AddressInput";
import { useFormContext } from "react-hook-form";
import { DraftProposalSchema } from "./../schemas/DraftProposalSchema";

// example calldata
// 0xa9059cbb00000000000000000000000065a3870f48b5237f27f674ec42ea1e017e111d630000000000000000000000000000000000000000000000000000000000000064
const CustomTransactionForm = ({ index }: { index: number }) => {
  type FormType = z.output<typeof DraftProposalSchema>;

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <div className="grid grid-cols-3 gap-3">
      <FormItem
        label="Target"
        required={true}
        htmlFor={`transactions.${index}.target`}
        className="col-span-2"
      >
        <AddressInput
          name={`transactions.${index}.target`}
          errorMessage={errors.transactions?.[index]?.target?.message}
        />
      </FormItem>

      <TextInput
        label="Value"
        name={`transactions.${index}.value`}
        control={control}
        placeholder="100"
      />

      <div className="col-span-3">
        <TextInput
          label="Calldata"
          name={`transactions.${index}.calldata`}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>
      <div className="col-span-3">
        <TextInput
          label="Description"
          name={`transactions.${index}.description`}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>
    </div>
  );
};

export default CustomTransactionForm;
