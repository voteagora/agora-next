import { useNonce } from "@/hooks/useNonce";
import Tenant from "@/lib/tenant/tenant";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { Address } from "viem";
import AgoraAPI from "@/app/lib/agoraAPI";
import { useSignTypedData } from "wagmi";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useState } from "react";
import { useTokenName } from "@/hooks/useTokenName";
import { trackEvent } from "@/lib/analytics";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";
import { config } from "@/app/Web3Provider";

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
    // Nonce for new delegations is 0n which does not pass !nonce condition
    // check for explicit undefined
    if (nonce === undefined || !name) {
      throw new Error("Unable to process delegation without nonce or name.");
    }

    setIsFetching(true);
    setIsFetched(false);

    const latestBlock = await contracts.token.provider.getBlock("latest");
    const expiry = (latestBlock?.timestamp || 0) + 1000;

    const signature = await signTypedDataAsync({
      domain: {
        ...gasRelayConfig.signature,
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

    const { status } = await waitForTransactionReceipt(config, {
      hash: hash,
      chainId: contracts.governor.chain.id,
    });

    if (status === "success") {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATE,
        event_data: {
          delegate: delegate.address as `0x${string}`,
          delegator: address as `0x${string}`,
          transaction_hash: hash,
        },
      });
    }

    setTxHash(hash);
    setIsFetching(false);
    setIsFetched(true);
  };

  return { call, isFetching, isFetched, txHash };
};
