"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

const action = async (address: `0x${string}` | undefined) => {
  const { contracts } = Tenant.current();
  const chainId = contracts.governor.chain.id;
  const contract = contracts.governor.address;

  const query = `
    SELECT COUNT(*) as count
    FROM alltenant.proposals p
    WHERE p.stage = 'AWAITING_SPONSORSHIP'::alltenant.proposal_stage
    AND EXISTS (
      SELECT 1 FROM alltenant.proposal_approved_sponsors
      WHERE proposal_id = p.id
      AND sponsor_address = $1
      AND alltenant.proposal_approved_sponsors.status != 'REJECTED'
    )
    AND p.chain_id = $2
    AND p.contract = $3
`;

  const count = await prisma.$queryRawUnsafe<{ count: number }[]>(
    query,
    address,
    chainId,
    contract
  );

  return count[0].count;
};

export default action;
