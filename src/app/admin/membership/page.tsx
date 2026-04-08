"use client";

import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useRef, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";
import { encodeFunctionData } from "viem";

const AdminMembershipPage = () => {
  const tenant = Tenant.current();
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const traceRef =
    useRef<ReturnType<typeof startFrontendMiradorFlowTrace>>(null);

  const { data: memberBalance } = useReadContract({
    address: tenant.contracts.token.address as `0x${string}`,
    abi: tenant.contracts.token.abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: tenant.contracts.token.chain.id,
  });

  const { writeContractAsync: addMember, error: addMemberError } =
    useWriteContract();
  const { isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: tenant.contracts.token.chain.id,
  });

  useEffect(() => {
    if (!traceRef.current || !txHash) {
      return;
    }

    if (isSuccess) {
      attachMiradorTransactionArtifacts(traceRef.current, {
        chainId: tenant.contracts.token.chain.id,
        txHash,
        txDetails: "Membership safeMint transaction",
      });
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "membership_admin_succeeded",
        eventName: "membership_admin_succeeded",
        details: {
          memberAddress: address,
          transactionHash: txHash,
        },
      });
      traceRef.current = null;
      return;
    }

    if (isError) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "membership_admin_failed",
        eventName: "membership_admin_failed",
        details: {
          memberAddress: address,
          transactionHash: txHash,
          error: error?.message,
        },
      });
      traceRef.current = null;
    }
  }, [
    address,
    error?.message,
    isError,
    isSuccess,
    tenant.contracts.token.chain.id,
    txHash,
  ]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "membership_admin_unmounted",
        eventName: "membership_admin_unmounted",
        details: {
          memberAddress: address,
        },
      });
      traceRef.current = null;
    };
  }, [address]);

  const handleAddMember = async () => {
    const inputData = encodeFunctionData({
      abi: tenant.contracts.token.abi as any,
      functionName: "safeMint",
      args: [address as `0x${string}`],
    });
    const trace = startFrontendMiradorFlowTrace({
      name: "MembershipAdmin",
      flow: MIRADOR_FLOW.membershipAdmin,
      step: "membership_mint_submit",
      context: {
        chainId: tenant.contracts.token.chain.id,
      },
      tags: ["admin", "membership", "frontend"],
      attributes: {
        action: "safe_mint",
        memberAddress: address,
      },
      startEventName: "membership_admin_started",
      startEventDetails: {
        action: "safe_mint",
        memberAddress: address,
      },
    });
    attachMiradorTransactionArtifacts(trace, {
      chainId: tenant.contracts.token.chain.id,
      inputData,
    });
    traceRef.current = trace;

    try {
      const hash = await addMember({
        address: tenant.contracts.token.address as `0x${string}`,
        abi: tenant.contracts.token.abi,
        functionName: "safeMint",
        args: [address as `0x${string}`],
        chainId: tenant.contracts.token.chain.id,
      });
      attachMiradorTransactionArtifacts(trace, {
        chainId: tenant.contracts.token.chain.id,
        inputData,
        txHash: hash,
        txDetails: "Membership safeMint transaction",
      });
      setTxHash(hash);
    } catch (submitError) {
      await closeFrontendMiradorFlowTrace(trace, {
        reason: "membership_admin_failed",
        eventName: "membership_admin_failed",
        details: {
          memberAddress: address,
          error:
            submitError instanceof Error
              ? submitError.message
              : String(submitError),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Membership Admin</h2>
      <div>
        <h3>Add Member</h3>
        <div className="flex flex-col gap-2">
          <label>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <span>Member balance:</span>
          <span>{memberBalance?.toString()}</span>
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={handleAddMember}
          >
            Add Member
          </button>
          {addMemberError && <span>{addMemberError.message}</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminMembershipPage;
