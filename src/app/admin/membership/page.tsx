"use client";

import { useWriteContract, useReadContract } from "wagmi";
import { useState } from "react";
import Tenant from "@/lib/tenant/tenant";

const AdminMembershipPage = () => {
  const tenant = Tenant.current();
  const [address, setAddress] = useState("");

  const { data: memberBalance } = useReadContract({
    address: tenant.contracts.token.address as `0x${string}`,
    abi: tenant.contracts.token.abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: tenant.contracts.token.chain.id,
  });

  const { writeContract: addMember, error: addMemberError } =
    useWriteContract();

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
            onClick={() =>
              addMember({
                address: tenant.contracts.token.address as `0x${string}`,
                abi: tenant.contracts.token.abi,
                functionName: "safeMint",
                args: [address as `0x${string}`],
              })
            }
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
