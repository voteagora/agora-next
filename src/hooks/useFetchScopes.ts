import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { Abi } from "viem";
import { getPublicClient } from "@/lib/viem";
import toast from "react-hot-toast";

interface ApiScope {
  proposal_type_id: number;
  scope_key: string;
  selector: string;
  description: string;
  disabled: boolean;
}

interface CreateScopeInput {
  proposal_type_id: number;
  scope_key: string;
  selector: string;
  description: string;
  parameters: string[];
  comparators: number[];
  types: number[];
}

interface ApiResponse {
  scopes: ApiScope[];
}

interface ContractScope {
  key: `0x${string}`;
  selector: `0x${string}`;
  parameters: string[];
  comparators: number[];
  types: number[];
  proposalTypeId: number;
  description: string;
  exists: boolean;
}

interface EnrichedScope extends ApiScope {
  parameters: string[];
  comparators: number[];
  types: number[];
  exists: boolean;
}

const { contracts } = Tenant.current();
const configuratorContract = contracts.proposalTypesConfigurator;

export function useFetchScopes() {
  const { data: apiScopes, isLoading: isLoadingApi } = useQuery<ApiScope[]>({
    queryKey: ["scopes"],
    queryFn: async () => {
      // TODO: remove this once we have a real endpoint
      const response = await fetch("http://localhost:8004/v1/scopes");
      const data: ApiResponse = await response.json();
      return data.scopes;
    },
  });

  const { data: enrichedScopes, isLoading: isLoadingContract } = useQuery<
    EnrichedScope[]
  >({
    queryKey: ["enrichedScopes", apiScopes?.toString()],
    queryFn: async () => {
      if (!apiScopes) return [];

      const enriched = await Promise.all(
        apiScopes.map(async (scope) => {
          const config = {
            address: configuratorContract?.address as `0x${string}`,
            abi: configuratorContract?.abi as Abi,
            functionName: "assignedScopes",
            args: [scope.proposal_type_id, `0x${scope.scope_key}`],
            chainId: configuratorContract?.chain.id,
          };
          const client = getPublicClient();
          const contractData = await client.readContract(config);

          if (!contractData) {
            return {
              ...scope,
              parameters: [],
              comparators: [],
              types: [],
              exists: false,
            };
          }

          const scopes = contractData as unknown as ContractScope[];
          const firstScope = scopes[0];

          if (!firstScope) {
            return {
              ...scope,
              parameters: [],
              comparators: [],
              types: [],
              exists: false,
            };
          }

          return {
            ...scope,
            parameters: firstScope.parameters || [],
            comparators: firstScope.comparators || [],
            types: firstScope.types || [],
            exists: firstScope.exists || false,
          };
        })
      );

      return enriched;
    },
    enabled: !!apiScopes,
  });

  return {
    scopes: enrichedScopes || [],
    isLoading: isLoadingApi || isLoadingContract,
  };
}

export const createScopeMutation = () => {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateScopeInput) => {
      return await writeContractAsync({
        address: configuratorContract?.address as `0x${string}`,
        abi: configuratorContract?.abi as Abi,
        functionName: "setScopeForProposalType",
        args: [
          input.proposal_type_id,
          `0x${input.scope_key}`,
          `${input.selector.startsWith("0x") ? input.selector.slice(2) : input.selector}`,
          input.parameters,
          input.comparators,
          input.types,
          input.description,
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scopes"] });
      queryClient.invalidateQueries({ queryKey: ["enrichedScopes"] });
      toast.success("Scope created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create scope: ${error.message}`);
    },
  });
};
