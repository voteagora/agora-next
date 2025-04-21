import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createScopeMutation } from "@/hooks/useFetchScopes";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Tenant from "@/lib/tenant/tenant";
import { isAddress } from "viem";
import { useContractAbi } from "@/hooks/useContractAbi";

const COMPARATORS = [
  { value: 0, label: "Empty" },
  { value: 1, label: "Equal" },
  { value: 2, label: "Less Than" },
  { value: 3, label: "Greater Than" },
];

const TYPES = [
  { value: 0, label: "None" },
  { value: 1, label: "Uint8" },
  { value: 2, label: "Uint16" },
  { value: 3, label: "Uint32" },
  { value: 4, label: "Uint64" },
  { value: 5, label: "Uint128" },
  { value: 6, label: "Uint256" },
  { value: 7, label: "Address" },
  { value: 8, label: "Bytes32" },
];

interface FunctionInfo {
  name: string;
  selector: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
}

const formSchema = z.object({
  contractAddress: z
    .string()
    .refine((val) => isAddress(val, { strict: false }), {
      message: "Invalid contract address",
    }),
  description: z.string().min(1, "Description is required"),
  selector: z.string().optional(),
  parameters: z.array(z.string()).default([]),
  comparators: z.array(z.number()).default([]),
  types: z.array(z.number()).default([]),
});

const { contracts } = Tenant.current();

export const CreateScopeDialog = ({
  proposalTypeId,
  onSuccess,
  closeDialog,
}: {
  proposalTypeId: number;
  onSuccess: () => void;
  closeDialog: () => void;
}) => {
  const { mutateAsync: createScope, isPending: isCreating } =
    createScopeMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractAddress: "" as `0x${string}`,
      description: "",
      selector: "",
      parameters: [],
      comparators: [],
      types: [],
    },
  });

  const contractAddress = useWatch({
    control: form.control,
    name: "contractAddress",
  });

  const { data: functions, isLoading: isLoadingAbi } =
    useContractAbi(contractAddress);

  const selector = useWatch({
    control: form.control,
    name: "selector",
  });

  const handleAddParameter = () => {
    // Don't allow adding parameters if a function is selected from ABI
    if (selector && functions?.some((f) => f.selector === selector)) {
      return;
    }

    const currentParams = form.getValues("parameters");
    const currentComparators = form.getValues("comparators");
    const currentTypes = form.getValues("types");

    form.setValue("parameters", [...currentParams, ""]);
    form.setValue("comparators", [...currentComparators, 0]);
    form.setValue("types", [...currentTypes, 0]);
  };

  const handleParameterChange = (index: number, value: string) => {
    const currentParams = form.getValues("parameters");
    currentParams[index] = value;
    form.setValue("parameters", currentParams);
  };

  const handleComparatorChange = (index: number, value: string) => {
    const currentComparators = form.getValues("comparators");
    currentComparators[index] = parseInt(value);
    form.setValue("comparators", currentComparators);
  };

  const handleTypeChange = (index: number, value: string) => {
    const currentTypes = form.getValues("types");
    currentTypes[index] = parseInt(value);
    form.setValue("types", currentTypes);
  };

  const handleFunctionSelect = (func: FunctionInfo) => {
    form.setValue("selector", func.selector || "");

    // Initialize parameters based on function inputs
    const inputs = func.inputs || [];
    form.setValue("parameters", Array(inputs.length).fill(""));
    form.setValue("comparators", Array(inputs.length).fill(0));

    const typeMap: Record<string, number> = {
      uint8: 0,
      uint16: 1,
      uint32: 2,
      uint64: 3,
      uint128: 4,
      uint256: 5,
      address: 6,
      bytes32: 7,
    };

    const types = inputs.map((input) => {
      const type = input.type.toLowerCase();
      return typeMap[type] ?? 0; // Default to uint8 if type not found
    });

    form.setValue("types", types);
  };

  const packScopeKey = (address: string, selector: string): string => {
    if (!address || !isAddress(address, { strict: false })) {
      throw new Error(`Invalid address format: ${address}`);
    }
    if (!selector || !/^0x[0-9a-fA-F]{8}$/.test(selector)) {
      throw new Error(
        `Invalid selector format (expected 0x followed by 8 hex chars): ${selector}`
      );
    }
    return `${address.toLowerCase().slice(2)}:${selector.toLowerCase().slice(2)}`;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.contractAddress || !values.selector) {
      return;
    }
    const scopeKey = packScopeKey(values.contractAddress, values.selector);

    try {
      await createScope({
        proposal_type_id: proposalTypeId,
        scope_key: scopeKey,
        selector: values.selector,
        description: values.description,
        parameters: values.parameters,
        comparators: values.comparators,
        types: values.types,
      });

      onSuccess();
      closeDialog();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error creating scope: ${error.message}`);
      } else {
        alert("An unknown error occurred while creating the scope.");
      }
    }
  };

  form.watch((value, { name }) => {
    if (name === "contractAddress" && value.contractAddress) {
      form.setValue("selector", "");
      form.setValue("parameters", []);
      form.setValue("comparators", []);
      form.setValue("types", []);
    }
  });

  const abiFound = (functions?.length || 0) > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Create New Scope
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define a new scope for proposal validation
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0x..." className="h-10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter scope description"
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isLoadingAbi && (
          <div className="text-sm text-wash">Fetching ABI...</div>
        )}

        {!abiFound &&
          !isLoadingAbi &&
          contractAddress &&
          isAddress(contractAddress, { strict: false }) && (
            <FormField
              control={form.control}
              name="selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Selector</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0x..." className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        {abiFound && (
          <FormField
            control={form.control}
            name="selector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Function Selector</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const func = functions?.find((f) => f.selector === value);
                    if (func) handleFunctionSelect(func);
                    field.onChange(value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select function" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[2000]">
                    {functions?.map((func) => (
                      <SelectItem key={func.selector} value={func.selector}>
                        {func.name} ({func.selector})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selector && selector.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Validation Parameters
                </Label>
                <p className="text-xs text-muted-foreground">
                  Define the parameters to validate in the function call
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleAddParameter}
                disabled={
                  !!(
                    selector && functions?.some((f) => f.selector === selector)
                  )
                }
                className={
                  "h-9 disabled:pointer-events-auto disabled:cursor-not-allowed"
                }
                type="button"
              >
                Add Parameter
              </Button>
            </div>
            {form.getValues("parameters").map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={form.getValues("parameters")[index]}
                    onChange={(e) =>
                      handleParameterChange(index, e.target.value)
                    }
                    placeholder="Param value"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Comparison
                  </Label>
                  <Select
                    value={form.getValues("comparators")[index].toString()}
                    onValueChange={(value) =>
                      handleComparatorChange(index, value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select comparator" />
                    </SelectTrigger>
                    <SelectContent className="z-[2000]">
                      {COMPARATORS.map((comp) => (
                        <SelectItem
                          key={comp.value}
                          value={comp.value.toString()}
                        >
                          {comp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={form.getValues("types")[index].toString()}
                    onValueChange={(value) => handleTypeChange(index, value)}
                    disabled={
                      !!(
                        selector &&
                        functions?.some((f) => f.selector === selector)
                      )
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="z-[2000]">
                      {TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value.toString()}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={closeDialog}
            className="h-10"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 disabled:pointer-events-auto disabled:cursor-not-allowed"
            disabled={isCreating || !form.formState.isValid}
          >
            {isCreating ? "Creating..." : "Create Scope"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
