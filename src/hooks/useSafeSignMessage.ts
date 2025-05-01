import "client-only";

import { useState, useCallback } from "react";
import { EIP712TypedData, SafeSignature } from "@safe-global/types-kit";
import { useAccount } from "wagmi";
import { useSafeProtocolKit } from "@/contexts/SafeProtocolKit";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { buildSignatureBytes } from "@safe-global/protocol-kit";

// Enum for signing methods
// Testing methods
enum SigningMethod {
  ETH_SIGN = "eth_sign",
  ETH_SIGN_TYPED_DATA = "eth_signTypedData",
  ETH_SIGN_TYPED_DATA_V3 = "eth_signTypedData_v3",
  ETH_SIGN_TYPED_DATA_V4 = "eth_signTypedData_v4",
  PERSONAL_SIGN = "personal_sign",
}

type MessageSigningOptions = {
  message: string | EIP712TypedData;
  safeAddress?: string; // Optional Safe address to use for signing
  signingMethod?: SigningMethod;
  preimageSafeAddress?: string;
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Custom hook for signing messages with a Safe wallet using the Protocol Kit
 */
export const useSafeSignMessage = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { protocolKit } = useSafeProtocolKit();
  const { safeApiKit } = useSafeApiKit();

  /**
   * Sign a message with the connected Safe wallet
   */
  const signMessage = useCallback(
    async ({ message, safeAddress }: MessageSigningOptions) => {
      setIsLoading(true);
      setError(null);
      setSignature(null);

      try {
        if (!safeAddress) {
          throw new Error(
            "No Safe address provided or connected. Please connect to a Safe wallet first."
          );
        }

        const safeMessage = protocolKit.createMessage(message);
        const signedMessage = await protocolKit.signMessage(
          safeMessage,
          SigningMethod.ETH_SIGN
        );

        const signature = signedMessage.getSignature(address);
        console.log("Signature: test", signature);
        // Add message to Safe Transaction Service using the correct API format
        await safeApiKit?.addMessage(safeAddress, {
          message,
          signature: buildSignatureBytes([signature as SafeSignature]),
        });

        // const safeMessageHash = await protocolKit.getSafeMessageHash(
        //   hashSafeMessage(message)
        // );
        // incase of second signature
        // apiKit.addMessageSignature(
        //   safeMessageHash,
        //   buildSignatureBytes([signature as SafeSignature])
        // );

        return signature;
      } catch (err) {
        console.error("Safe signing error:", err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    signMessage,
    isLoading,
    error,
    signature,
  };
};
