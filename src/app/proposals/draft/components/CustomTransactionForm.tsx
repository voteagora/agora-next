import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { useFormContext } from "react-hook-form";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";

const TransferTransactionForm = ({ index }: { index: number }) => {
  type FormType = z.output<typeof draftProposalSchema>;

  const {
    register,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <div className="grid grid-cols-2 gap-3">
      <FormItem
        label="Target"
        required={false}
        htmlFor={`transactions.${index}.target`}
      >
        <TextInput
          name={`transactions.${index}.target`}
          register={register}
          placeholder="0xabc..."
          options={{
            required: "Target is required.",
          }}
          errorMessage={errors.transactions?.[index]?.target?.message}
        />
      </FormItem>
      <FormItem
        label="Value"
        required={false}
        htmlFor={`transactions.${index}.value`}
      >
        <TextInput
          name={`transactions.${index}.value`}
          register={register}
          placeholder="100"
          options={{
            required: "Value is required.",
          }}
          errorMessage={errors.transactions?.[index]?.value?.message}
        />
      </FormItem>
      <div className="col-span-2">
        <FormItem
          label="Calldata"
          required={false}
          htmlFor={`transactions.${index}.calldata`}
        >
          <TextInput
            name={`transactions.${index}.calldata`}
            register={register}
            placeholder="What is this transaction all about?"
            options={{
              required: "Calldata is required.",
            }}
            errorMessage={errors.transactions?.[index]?.calldata?.message}
          />
        </FormItem>
      </div>
      <div className="col-span-2">
        <FormItem
          label="Description"
          required={false}
          htmlFor={`transactions.${index}.description`}
        >
          <TextInput
            name={`transactions.${index}.description`}
            register={register}
            placeholder="What is this transaction all about?"
            options={{
              required: "Description is required.",
            }}
            errorMessage={errors.transactions?.[index]?.description?.message}
          />
        </FormItem>
      </div>
      {/* target and calldata are not included in UI of the form, but we need them for consistency */}
      <input type="hidden" {...register(`transactions.${index}.target`)} />
      <input type="hidden" {...register(`transactions.${index}.calldata`)} />
    </div>
  );
};

export default TransferTransactionForm;
