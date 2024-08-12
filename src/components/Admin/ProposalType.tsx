"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { XCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

type Props = {
  proposalType: ProposalType;
  index: number;
  votableSupply: string;
};

type ProposalType = {
  quorum: number;
  approval_threshold: number;
  name: string;
};

const proposalTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  approval_threshold: z.coerce.number().lte(100),
  quorum: z.coerce.number().lte(100),
});

export default function ProposalType({
  proposalType: { quorum, approval_threshold, name },
  index,
  votableSupply,
}: Props) {
  const { namespace, contracts, token } = Tenant.current();

  const form = useForm<z.infer<typeof proposalTypeSchema>>({
    resolver: zodResolver(proposalTypeSchema),
    defaultValues: {
      quorum,
      approval_threshold,
      name,
      description: "",
    },
  });

  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** 18)
  );

  const deleteProposalTypeArgs = [BigInt(index), 0, 0, ""];
  // TODO: Replace this with a governor-level flag
  // TODO: Aso add proposal type configurator version flag
  if (namespace === TENANT_NAMESPACES.CYBER) {
    deleteProposalTypeArgs.push("0x" + "0".repeat(40));
  }

  const { config: deleteProposalTypeConfig } = usePrepareContractWrite({
    address: contracts.proposalTypesConfigurator!.address as `0x${string}`,
    abi: contracts.proposalTypesConfigurator!.abi,
    functionName: "setProposalType",
    args: deleteProposalTypeArgs,
  });
  const {
    data: resultDeleteProposalType,
    write: writeDeleteProposalType,
    isLoading: isLoadingDeleteProposalType,
  } = useContractWrite(deleteProposalTypeConfig);
  const { isLoading: isLoadingDeleteProposalTypeTransaction } =
    useWaitForTransaction({
      hash: resultDeleteProposalType?.hash,
    });

  const formValues = form.watch();
  const setProposalTypeArgs = [
    BigInt(index),
    Math.round(formValues.quorum * 100),
    Math.round(formValues.approval_threshold * 100),
    formValues.name,
  ];

  // TODO: Replace this with a governor-level flag
  // TODO: Aso add proposal type configurator version flag.
  if (namespace === TENANT_NAMESPACES.CYBER) {
    setProposalTypeArgs.push("0x" + "0".repeat(40));
  }

  const { config: setProposalTypeConfig, isError: setProposalTypeError } =
    usePrepareContractWrite({
      address: contracts.proposalTypesConfigurator!.address as `0x${string}`,
      abi: contracts.proposalTypesConfigurator!.abi,
      functionName: "setProposalType",
      args: setProposalTypeArgs,
    });

  const {
    data: resultSetProposalType,
    write: writeSetProposalType,
    isLoading: isLoadingSetProposalType,
  } = useContractWrite(setProposalTypeConfig);
  const { isLoading: isLoadingSetProposalTypeTransaction } =
    useWaitForTransaction({
      hash: resultSetProposalType?.hash,
    });
  const isLoading =
    isLoadingDeleteProposalType ||
    isLoadingDeleteProposalTypeTransaction ||
    isLoadingSetProposalType ||
    isLoadingSetProposalTypeTransaction;
  const isDisabled = isLoading || name == "Optimistic";

  function onSubmit(values: z.infer<typeof proposalTypeSchema>) {
    writeSetProposalType?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Proposal type {index + 1}</p>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-destructive/10 group w-9 h-9"
              disabled={isDisabled || setProposalTypeError}
              onClick={() => {
                writeDeleteProposalType?.();
              }}
              type="button"
            >
              <XCircle className="w-[18px] h-[18px] text-muted-foreground group-hover:text-destructive" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name="name"
            disabled={isDisabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          <FormField
            control={form.control}
            name="quorum"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Quorum</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      min={0}
                      max={100}
                      step={0.01}
                      type="number"
                      disabled={isDisabled}
                      onChange={(e) => {
                        form.setValue(
                          "quorum",
                          Number(e.target.value) > 100
                            ? 100
                            : Number(e.target.value) < 0
                              ? 0
                              : Number(e.target.value)
                        );
                      }}
                    />
                    <div className="absolute right-[12px] text-sm text-muted-foreground flex gap-2 text-center items-center">
                      <p>% of votable supply</p>
                      <div className="mx-auto w-[1px] bg-muted-foreground/40 h-4" />
                      <p className="text-[0.8rem] col-span-3">
                        {formatNumber(
                          Math.floor(
                            (formattedVotableSupply * formValues.quorum) / 100
                          ),
                          0,
                          1
                        )}{" "}
                        {token.symbol}
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="approval_threshold"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Approval threshold</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      min={0}
                      max={100}
                      step={0.01}
                      type="number"
                      disabled={isDisabled}
                      onChange={(e) => {
                        form.setValue(
                          "approval_threshold",
                          Number(e.target.value) > 100
                            ? 100
                            : Number(e.target.value) < 0
                              ? 0
                              : Number(e.target.value)
                        );
                      }}
                    />
                    <div className="absolute right-[12px] text-sm text-muted-foreground">
                      <p>% of votes for each proposal</p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          variant="outline"
          loading={isLoading}
          disabled={isDisabled || setProposalTypeError}
        >
          Set proposal type
        </Button>
      </form>
    </Form>
  );
}
