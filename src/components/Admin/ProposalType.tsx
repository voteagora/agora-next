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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { XCircle, PlusCircle, ChevronsUpDown } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import {
  PROPOSAL_TYPES_CONFIGURATOR_FACTORY,
  TENANT_NAMESPACES,
} from "@/lib/constants";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { useTotalSupply } from "@/hooks/useTotalSupply";
import { formatUnits } from "viem";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "../ui/separator";
import toast from "react-hot-toast";
import BlockScanUrls from "../shared/BlockScanUrl";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ScopeData, FormattedProposalType } from "@/lib/types";
import { ScopeDetails } from "./ScopeDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ProposalType as ProposalTypeEnum } from "@/app/proposals/draft/types";

type Props = {
  proposalType: FormattedProposalType;
  index: number;
  votableSupply: string;
  availableScopes: ScopeData[];
  onDelete: (id: number, hash?: string) => void;
  onSuccessSetProposalType: (id: number, hash?: string) => void;
};

const proposalTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  approval_threshold: z.coerce.number().lte(100),
  quorum: z.coerce.number().lte(100),
  voting_module_type: z.nativeEnum(ProposalTypeEnum),
});

export default function ProposalType({
  proposalType,
  index,
  votableSupply,
  availableScopes,
  onDelete,
  onSuccessSetProposalType,
}: Props) {
  const { quorum, approval_threshold, name, isClientSide, scopes } =
    proposalType;
  const proposalTypeId = index;
  const openDialog = useOpenDialog();

  const { namespace, contracts, token } = Tenant.current();
  const configuratorContract = contracts.proposalTypesConfigurator;

  const proposalTypeWithoutDescription =
    contracts.proposalTypesConfiguratorFactory ===
    PROPOSAL_TYPES_CONFIGURATOR_FACTORY.WITHOUT_DESCRIPTION;

  const [assignedScopes, setAssignedScopes] = useState<ScopeData[]>(
    scopes ?? []
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

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
    address: configuratorContract!.address as `0x${string}`,
    abi: configuratorContract!.abi,
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

  const {
    data: resultAddScope,
    writeContractAsync: writeAddScope,
    isPending: isLoadingAddScope,
  } = useWriteContract();

  const { isLoading: isLoadingAddScopeTransaction } =
    useWaitForTransactionReceipt({
      hash: resultAddScope,
    });

  const {
    data: resultDeleteScope,
    writeContractAsync: writeDeleteScope,
    isPending: isLoadingDeleteScope,
  } = useWriteContract();

  const { isLoading: isLoadingDeleteScopeTransaction } =
    useWaitForTransactionReceipt({
      hash: resultDeleteScope,
    });

  // --- Loading States ---
  const isLoading =
    isLoadingDeleteProposalType ||
    isLoadingDeleteProposalTypeTransaction ||
    isLoadingSetProposalType ||
    isLoadingSetProposalTypeTransaction ||
    isLoadingAddScope ||
    isLoadingAddScopeTransaction ||
    isLoadingDeleteScope ||
    isLoadingDeleteScopeTransaction;

  const isDisabled = isLoading;

  // --- Handlers ---

  function onSubmit(values: z.infer<typeof proposalTypeSchema>) {
    const votingModuleType = values.voting_module_type;

    const proposalTypeAddress = getProposalTypeAddress(votingModuleType);

    if (!proposalTypeAddress) {
      throw new Error("Proposal type address not found");
    }

    const quorum =
      votingModuleType === ProposalTypeEnum.OPTIMISTIC ? 0 : formValues.quorum;
    const approvalThreshold =
      votingModuleType === ProposalTypeEnum.OPTIMISTIC
        ? 0
        : formValues.approval_threshold;

    const setProposalTypeArgs = [
      BigInt(index),
      Math.round(quorum * 100),
      Math.round(approvalThreshold * 100),
      `${formValues.name}${formValues.name.toLowerCase().includes(votingModuleType) || contracts.supportScopes ? "" : ` - [${votingModuleType}]`}`,
      ...(proposalTypeWithoutDescription ? [] : [formValues.description || ""]),
      proposalTypeAddress,
    ];

    writeSetProposalType({
      address: configuratorContract?.address as `0x${string}`,
      abi: configuratorContract?.abi,
      functionName: "setProposalType",
      args: setProposalTypeArgs,
    });
  }

  const handleAddScope = async (scopeToAdd: ScopeData) => {
    setPopoverOpen(false);

    if (!scopeToAdd.selector) {
      toast.error("Scope has no selector");
      return;
    }

    const scopeArg = {
      key: scopeToAdd.scope_key.startsWith("0x")
        ? (scopeToAdd.scope_key as `0x${string}`)
        : (`0x${scopeToAdd.scope_key}` as `0x${string}`),
      selector: scopeToAdd.selector.startsWith("0x")
        ? (scopeToAdd.selector as `0x${string}`)
        : (`0x${scopeToAdd.selector}` as `0x${string}`),
      parameters: scopeToAdd.parameters || [],
      comparators: scopeToAdd.comparators || [],
      types: scopeToAdd.types || [],
      proposalTypeId: proposalTypeId,
      description: scopeToAdd.description,
      exists: true,
    };

    const addArgs = [BigInt(proposalTypeId), scopeArg];

    try {
      toast.loading("Adding scope...");

      await writeAddScope(
        {
          address: configuratorContract?.address as `0x${string}`,
          abi: configuratorContract?.abi,
          functionName: "addScopeForProposalType",
          args: addArgs,
        },
        {
          onSuccess: (hash) => {
            toast.dismiss(); // Dismiss loading toast
            toast.success(
              <div className="flex flex-col items-center gap-2 p-1">
                <span className="text-sm font-semibold">Scope added</span>
                {hash || resultAddScope ? (
                  <BlockScanUrls hash1={hash || resultAddScope} />
                ) : null}
              </div>
            );
          },
          onError: (error: any) => {
            toast.dismiss();
            toast.error(`Failed to add scope: ${error.message}`);
          },
        }
      );

      setAssignedScopes((prev) => [...prev, scopeToAdd]);
    } catch (e) {
      console.error("Error adding scope:", e);
      toast.error("Failed to initiate add scope transaction.");
    }
  };

  const handleRemoveScope = async (scopeToRemove: ScopeData) => {
    const scopesWithKey = assignedScopes.filter(
      (scope) => scope.scope_key === scopeToRemove.scope_key
    );
    if (scopesWithKey.length > 1) {
      toast.error(
        `Found ${scopesWithKey.length} scopes with the same key. Complete all transactions to avoid proposal type issues.`
      );
    }

    for (let idx = 0; idx < scopesWithKey.length; idx++) {
      const deleteArgs = [
        BigInt(proposalTypeId),
        scopeToRemove.scope_key.startsWith("0x")
          ? (scopeToRemove.scope_key as `0x${string}`)
          : (`0x${scopeToRemove.scope_key}` as `0x${string}`),
        BigInt(0), // Always delete the first scope until there is none. After deleting 0 then 1 becomes 0 and so on.
      ];

      try {
        toast.loading("Removing scope...");

        await writeDeleteScope(
          {
            address: configuratorContract?.address as `0x${string}`,
            abi: configuratorContract?.abi,
            functionName: "deleteScope",
            args: deleteArgs,
          },
          {
            onSuccess: (hash) => {
              toast.dismiss();
              toast.success(
                <div className="flex flex-col items-center gap-2 p-1">
                  <span className="text-sm font-semibold">Scope removed</span>
                  {hash || resultDeleteScope ? (
                    <BlockScanUrls hash1={hash || resultDeleteScope} />
                  ) : null}
                </div>
              );
            },
            onError: (error: any) => {
              toast.dismiss();
              toast.error(`Failed to remove scope: ${error.message}`);
            },
          }
        );
        setAssignedScopes((prev) => prev.filter((s, i) => i !== 0));
      } catch (e) {
        console.error("Error removing scope:", e);
        toast.error("Failed to initiate remove scope transaction.");
      }
    }
  };

  const handleCreateScope = () => {
    openDialog({
      type: "CREATE_SCOPE",
      params: {
        proposalTypeId: proposalTypeId,
        onSuccess: (newScope: ScopeData) => {
          setAssignedScopes((prev) => [...prev, newScope]);
        },
      },
      className: "sm:w-[32rem]",
    });
  };

  // Filter available scopes to show only those not already assigned
  const unassignedScopes = useMemo(
    () =>
      availableScopes.filter(
        (availScope) =>
          !assignedScopes.some(
            (assignedScope) => assignedScope.scope_key === availScope.scope_key
          )
      ),
    [availableScopes, assignedScopes]
  );

  const hasOptimisticProposalType = useMemo(() => {
    try {
      const address = getProposalTypeAddress(ProposalTypeEnum.OPTIMISTIC);
      return address !== null;
    } catch (e) {
      return false;
    }
  }, []);

  const hasApprovalProposalType = useMemo(() => {
    try {
      const address = getProposalTypeAddress(ProposalTypeEnum.APPROVAL);
      return address !== null;
    } catch (e) {
      return false;
    }
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-secondary">
              Proposal type {index + 1} (id={proposalType.proposal_type_id})
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
          <FormField
            control={form.control}
            name="voting_module_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voting module type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormItem>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voting module type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProposalTypeEnum.BASIC}>
                          Standard
                        </SelectItem>
                        {hasApprovalProposalType && (
                          <SelectItem value={ProposalTypeEnum.APPROVAL}>
                            Approval
                          </SelectItem>
                        )}
                        {hasOptimisticProposalType && (
                          <SelectItem value={ProposalTypeEnum.OPTIMISTIC}>
                            Optimistic
                          </SelectItem>
                        )}
                      </SelectContent>
                    </FormItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {formValues.voting_module_type === ProposalTypeEnum.OPTIMISTIC ? (
          <div>
            <p>
              Optimistic proposals do not require a quorum or approval
              threshold. The value is always 0.
            </p>
          </div>
        ) : (
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
        )}

        {/* Scopes Section */}
        {contracts.supportScopes && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Scopes</h3>
                  <p className="text-sm text-tertiary">
                    Define what this proposal type can access and modify
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateScope}
                  className="gap-2 py-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:block">Create New Scope</span>
                </Button>
              </div>

              <div className="grid gap-3">
                {assignedScopes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-wash">
                    <p className="text-sm text-tertiary mb-2">
                      No scopes assigned yet
                    </p>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={handleCreateScope}
                      className="text-primary"
                    >
                      Add your first scope
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {assignedScopes.map((scope) => (
                      <div
                        key={scope.scope_key}
                        className="flex items-center justify-between bg-card hover:bg-accent/5 transition-colors border border-line rounded-lg p-4 w-full"
                      >
                        <ScopeDetails scope={scope} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-tertiary hover:text-destructive"
                          onClick={() => handleRemoveScope(scope)}
                          disabled={isLoadingDeleteScope || isLoading}
                          type="button"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Scope Popover */}
                {unassignedScopes.length > 0 && (
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between py-4"
                        disabled={isLoadingAddScope || isLoading}
                      >
                        Add Existing Scope
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <div className="flex flex-col">
                        <div className="max-h-[300px] overflow-auto">
                          <div className="divide-y">
                            {unassignedScopes.map((scope) => (
                              <button
                                key={scope.scope_key}
                                className="w-full p-3 text-left hover:bg-accent/50 transition-colors"
                                onClick={() => handleAddScope(scope)}
                              >
                                <ScopeDetails scope={scope} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}

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
