import { getProposalTypesFromDaoNode } from "@/app/lib/dao-node/client";
import { ProposalRepositoryContext } from "@/features/proposals/data/repositories/shared";
import { findProposalType } from "@/lib/prismaUtils";
import { getPublicClient } from "@/lib/viem";

type ProposalTypeScope = {
  proposal_type_id: string;
  scope_key: string;
  selector: string;
  description: string;
  disabled_event: string;
  deleted_event: string;
  status: string;
};

export async function getProposalTypesData({
  namespace,
  contracts,
  ui,
}: ProposalRepositoryContext) {
  const configuratorContract = contracts.proposalTypesConfigurator;
  const easV2GovlessVotingEnabled =
    ui.toggle("easv2-govlessvoting")?.enabled ?? false;

  if (!configuratorContract) {
    return [];
  }

  let types = [];

  const typesFromApi = await getProposalTypesFromDaoNode();
  if (typesFromApi) {
    const parsedTypes = Object.entries(typesFromApi.proposal_types)
      ?.filter(([proposalTypeId, type]: any) => !!type.name)
      ?.map(([proposalTypeId, type]: any) => ({
        ...type,
        proposal_type_id: String(proposalTypeId),
        quorum: Number(type.quorum),
        approval_threshold: Number(type.approval_threshold),
        isClientSide: false,
        module: type.module,
      }));
    types = parsedTypes;
  } else {
    const contractExists =
      configuratorContract.address !==
      "0x0000000000000000000000000000000000000000";
    const contractToUse = easV2GovlessVotingEnabled
      ? contracts.governor.address
      : contractExists
        ? configuratorContract.address
        : undefined;

    types = await findProposalType({
      namespace,
      contract: contractToUse,
    });
  }

  if (!contracts.supportScopes) {
    return types.map((type: any) => ({
      ...type,
      proposal_type_id: String(type.proposal_type_id),
      quorum: Number(type.quorum),
      approval_threshold: Number(type.approval_threshold),
      isClientSide: false,
      module: type.module,
      scopes: [],
    }));
  }

  return await Promise.all(
    types.map(async (type: any) => {
      const scopes =
        typesFromApi?.proposal_types?.[type.proposal_type_id]?.scopes;
      const formattedScopes: ProposalTypeScope[] = scopes
        ? scopes
            .filter((scope: any) => scope.status === "created")
            .reduce((unique: ProposalTypeScope[], scope: any) => {
              if (
                !unique.find((entry) => entry.scope_key === scope.scope_key)
              ) {
                unique.push({
                  proposal_type_id: type.proposal_type_id,
                  scope_key: scope.scope_key,
                  selector: scope.selector,
                  description: scope.description,
                  disabled_event: scope.disabled_event,
                  deleted_event: scope.deleted_event,
                  status: scope.status,
                });
              }
              return unique;
            }, [])
        : [];

      const enriched = await Promise.all(
        formattedScopes.map(async (scope) => {
          const config = {
            address: configuratorContract?.address as `0x${string}`,
            abi: configuratorContract?.abi,
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

          const scopes = contractData as any[];

          if (!scopes.length) {
            return {
              ...scope,
              parameters: [],
              comparators: [],
              types: [],
              exists: false,
            };
          }

          return scopes.map((assignedScope) => ({
            ...assignedScope,
            scope_key: assignedScope.key,
            parameters: assignedScope.parameters || [],
            comparators: assignedScope.comparators || [],
            types: assignedScope.types || [],
            exists: assignedScope.exists || false,
          }));
        })
      );

      return {
        name: type.name,
        proposal_type_id: String(type.proposal_type_id),
        quorum: Number(type.quorum),
        approval_threshold: Number(type.approval_threshold),
        isClientSide: false,
        module: type.module,
        scopes: enriched.flat(),
      };
    })
  );
}
