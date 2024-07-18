import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import AddressInput from "./form/AddressInput";
import { useFormContext } from "react-hook-form";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";

// example calldata
// 0xa9059cbb00000000000000000000000065a3870f48b5237f27f674ec42ea1e017e111d630000000000000000000000000000000000000000000000000000000000000064
const CustomTransactionForm = ({ index }: { index: number }) => {
  type FormType = z.output<typeof draftProposalSchema>;

  const {
    register,
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
      <FormItem
        label="Value"
        required={true}
        htmlFor={`transactions.${index}.value`}
      >
        <TextInput
          name={`transactions.${index}.value`}
          register={register}
          placeholder="100"
          errorMessage={errors.transactions?.[index]?.value?.message}
        />
      </FormItem>
      <div className="col-span-3">
        <FormItem
          label="Calldata"
          required={true}
          htmlFor={`transactions.${index}.calldata`}
        >
          <TextInput
            name={`transactions.${index}.calldata`}
            register={register}
            placeholder="What is this transaction all about?"
            errorMessage={errors.transactions?.[index]?.calldata?.message}
          />
        </FormItem>
      </div>
      <div className="col-span-3">
        <FormItem
          label="Description"
          required={true}
          htmlFor={`transactions.${index}.description`}
        >
          <TextInput
            name={`transactions.${index}.description`}
            register={register}
            placeholder="What is this transaction all about?"
            errorMessage={errors.transactions?.[index]?.description?.message}
          />
        </FormItem>
      </div>
    </div>
  );
};

export default CustomTransactionForm;
