import { MissingVote } from "@/lib/voteUtils";
import { useState } from "react";
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

  const { data: smartAccountClient } = useLyraDeriveAccount();

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined);

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
          setIsLoading(false);
          setIsError(false);
          setIsSuccess(true);
          setTxnHash(txn.hash);
        })
        .catch((error) => {
          setIsError(true);
          setIsSuccess(false);
        });
    }
  };

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    write,
    data: { standardTxHash: txnHash, advancedTxHash: undefined },
  };
};
