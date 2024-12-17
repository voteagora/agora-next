import { useNonce } from "@/hooks/useNonce";
import Tenant from "@/lib/tenant/tenant";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { Address } from "viem";
import AgoraAPI from "@/app/lib/agoraAPI";
import { useSignTypedData } from "wagmi";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useState } from "react";
import { useTokenName } from "@/hooks/useTokenName";

interface Props {
  address: `0x${string}` | undefined;
  delegate: DelegateChunk;
}

const types = {
  Delegation: [
    { name: "delegatee", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
  ],
};

export const useSponsoredDelegation = ({ address, delegate }: Props) => {
  const { ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();

  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const isGasRelayEnabled = ui.toggle("sponsoredDelegate")?.enabled === true;
  const gasRelayConfig =
    (ui.toggle("sponsoredDelegate")?.config as UIGasRelayConfig) || {};

  const { data: nonce } = useNonce({
    address: address,
    enabled: isGasRelayEnabled && !!address,
  });

  const { data: name } = useTokenName({
    enabled: isGasRelayEnabled && !!address,
  });

  const call = async () => {
    if (!nonce || !name) {
      throw new Error("Unable to process delegation without nonce or name.");
    }

    setIsFetching(true);
    setIsFetched(false);

    const latestBlock = await contracts.token.provider.getBlock("latest");
    const expiry = (latestBlock?.timestamp || 0) + 1000;

    const signature = await signTypedDataAsync({
      domain: {
        ...gasRelayConfig,
        name,
        chainId: contracts.token.chain.id,
        verifyingContract: contracts.token.address as Address,
      },
      types,
      primaryType: "Delegation",
      message: {
        delegatee: delegate.address,
        nonce,
        expiry,
      },
    });

    const agoraAPI = new AgoraAPI();
    const response = await agoraAPI.post("/relay/delegate", "v1", {
      signature,
      delegatee: delegate.address,
      nonce: nonce?.toString(),
      expiry,
    });

    const hash = await response.json();
    setTxHash(hash);
    setIsFetching(false);
    setIsFetched(true);
  };

  return { call, isFetching, isFetched, txHash };
};
