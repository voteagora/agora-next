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
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { getVotingModuleTypeForProposalType } from "@/lib/utils";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { useTotalSupply } from "@/hooks/useTotalSupply";
import { formatUnits } from "viem";
import { useEffect } from "react";

type Props = {
  proposalType: ProposalType;
  index: number;
  votableSupply: string;
  onDelete: (id: number, hash?: string) => void;
  onSuccessSetProposalType: (id: number, hash?: string) => void;
};

type ProposalType = {
  quorum: number;
  approval_threshold: number;
  name: string;
  isClientSide: boolean;
};

const proposalTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  approval_threshold: z.coerce.number().lte(100),
  quorum: z.coerce.number().lte(100),
});

export default function ProposalType({
  proposalType: { quorum, approval_threshold, name, isClientSide },
  index,
  votableSupply,
  onDelete,
  onSuccessSetProposalType,
}: Props) {
  const { namespace, contracts, token } = Tenant.current();
  const totalSupply = useTotalSupply({
    enabled: namespace === TENANT_NAMESPACES.SCROLL,
  });

  const formattedSupply = Number(
    formatUnits(
      namespace === TENANT_NAMESPACES.SCROLL
        ? (totalSupply.data ?? BigInt(votableSupply))
        : BigInt(votableSupply),
      token.decimals
    )
  );

  const form = useForm<z.infer<typeof proposalTypeSchema>>({
    resolver: zodResolver(proposalTypeSchema),
    defaultValues: {
      quorum,
      approval_threshold,
      name,
      description: "",
    },
  });

  const formValues = form.watch();

  const deleteProposalTypeArgs = [
    BigInt(index),
    Math.round(formValues.quorum * 100),
    Math.round(formValues.approval_threshold * 100),
    "",
  ];

  // TODO: Replace this with a governor-level flag
  // TODO: Aso add proposal type configurator version flag
  if (namespace !== TENANT_NAMESPACES.CYBER) {
    deleteProposalTypeArgs.push(""); // Cyber proposal types don't have description field
  }

  deleteProposalTypeArgs.push("0x" + "0".repeat(40));

  const { data: deleteProposalTypeConfig } = useSimulateContract({
    address: contracts.proposalTypesConfigurator!.address as `0x${string}`,
    abi: contracts.proposalTypesConfigurator!.abi,
    functionName: "setProposalType",
    args: deleteProposalTypeArgs,
  });

  const {
    data: resultDeleteProposalType,
    writeContract: writeDeleteProposalType,
    isPending: isLoadingDeleteProposalType,
    isSuccess: isSuccessDeleteProposalType,
  } = useWriteContract();
  const { isLoading: isLoadingDeleteProposalTypeTransaction } =
    useWaitForTransactionReceipt({
      hash: resultDeleteProposalType,
    });

  useEffect(() => {
    if (isSuccessDeleteProposalType) {
      onDelete(index, resultDeleteProposalType); // Call onDelete to remove the row
    }
  }, [isSuccessDeleteProposalType, onDelete, index]);

  const {
    data: resultSetProposalType,
    writeContract: writeSetProposalType,
    isPending: isLoadingSetProposalType,
    isError: isErrorSetProposalType,
    isSuccess: isSuccessSetProposalType,
  } = useWriteContract();

  useEffect(() => {
    if (isSuccessSetProposalType) {
      onSuccessSetProposalType(index, resultSetProposalType);
    }
  }, [isSuccessSetProposalType, onSuccessSetProposalType, index]);

  const { isLoading: isLoadingSetProposalTypeTransaction } =
    useWaitForTransactionReceipt({
      hash: resultSetProposalType,
    });
  const isLoading =
    isLoadingDeleteProposalType ||
    isLoadingDeleteProposalTypeTransaction ||
    isLoadingSetProposalType ||
    isLoadingSetProposalTypeTransaction;
  const isDisabled = isLoading;

  function onSubmit(values: z.infer<typeof proposalTypeSchema>) {
    const name = values.name;
    const votingModuleType = getVotingModuleTypeForProposalType({
      quorum,
      approval_threshold,
      name,
    });

    const proposalTypeAddress = getProposalTypeAddress(votingModuleType);

    if (!proposalTypeAddress) {
      throw new Error("Proposal type address not found");
    }

    const setProposalTypeArgs = [
      BigInt(index),
      Math.round(formValues.quorum * 100),
      Math.round(formValues.approval_threshold * 100),
      formValues.name,
      formValues.description || "",
      proposalTypeAddress,
    ];

    writeSetProposalType({
      address: contracts.proposalTypesConfigurator?.address as `0x${string}`,
      abi: contracts.proposalTypesConfigurator?.abi,
      functionName: "setProposalType",
      args: setProposalTypeArgs,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-secondary">
              Proposal type {index + 1}
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-destructive/10 group w-9 h-9"
              disabled={isDisabled || isErrorSetProposalType}
              onClick={() => {
                if (isClientSide) {
                  onDelete(index, resultDeleteProposalType);
                } else {
                  writeDeleteProposalType(deleteProposalTypeConfig!.request);
                }
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
                      <p>
                        % of{" "}
                        {namespace === TENANT_NAMESPACES.SCROLL
                          ? "total"
                          : "votable"}{" "}
                        supply
                      </p>
                      <div className="mx-auto w-[1px] bg-muted-foreground/40 h-4" />
                      <p className="text-[0.8rem] col-span-3">
                        {formatNumber(
                          Math.floor(
                            (formattedSupply * formValues.quorum) / 100
                          ).toString(),
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
          disabled={isDisabled || isErrorSetProposalType}
        >
          Set proposal type
        </Button>
      </form>
    </Form>
  );
}
