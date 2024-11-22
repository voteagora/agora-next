import { MissingVote } from "@/lib/voteUtils";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { useLyraDeriveAccount } from "@/hooks/useSmartAccountDerive";

export const useScwVoting = ({
  proposalId,
  support,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts } = Tenant.current();

  const { writeContractAsync: standardVote, isError: _standardVoteError } =
    useWriteContract();

  const { data: smartAccountClient } = useLyraDeriveAccount();

  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );

  const data = contracts.governor.contract.interface.encodeFunctionData(
    !!reason ? "castVoteWithReason" : "castVote",
    !!reason
      ? [BigInt(proposalId), support, reason]
      : [BigInt(proposalId), support]
  ) as `0x${string}`;

  const write = () => {
    if (smartAccountClient) {
      smartAccountClient
        .sendUserOperation({
          account: smartAccountClient.account!,
          uo: {
            target: contracts.governor.address as `0x${string}`,
            data: data,
          },
        })
        .then((txn: any) => {
          console.log(txn);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return {
    isLoading: standardVoteLoading,
    isError: standardVoteError,
    isSuccess: standardVoteSuccess,
    write,
    data: { standardTxHash },
  };
};
