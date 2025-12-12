import { prismaWeb3Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export type BadgeDefinition = {
  badge_definition_id: string;
  name: string;
  description: string;
  revocable: string;
  block_number: bigint;
};

export type IdentityBadge = {
  badge_definition_id: string;
  attestation_time: bigint;
  expiration_time: bigint;
  metadata: string | null;
  block_number: bigint;
  definition: BadgeDefinition;
};

export async function fetchBadgesForDelegate(
  address: string
): Promise<IdentityBadge[]> {
  const { namespace, contracts } = Tenant.current();
  const daoId = contracts.governor.address.toLowerCase();

  const query = `
    SELECT 
      ib.badge_definition_id,
      ib.attestation_time,
      ib.expiration_time,
      ib.metadata,
      ib.block_number,
      bd.name,
      bd.description,
      bd.revocable
    FROM ${namespace}.identity_badges ib
    JOIN ${namespace}.badge_definitions bd 
      ON ib.badge_definition_id = bd.badge_definition_id 
      AND ib.dao_id = bd.dao_id
    WHERE ib.revoked = false
      AND ib."user" = $1
      AND ib.dao_id = $2
    ORDER BY ib.attestation_time DESC
  `;

  const results = await prismaWeb3Client.$queryRawUnsafe<
    {
      badge_definition_id: string;
      attestation_time: bigint;
      expiration_time: bigint;
      metadata: string | null;
      block_number: bigint;
      name: string;
      description: string;
      revocable: string;
    }[]
  >(query, address.toLowerCase(), daoId);

  return results.map((row) => ({
    badge_definition_id: row.badge_definition_id,
    attestation_time: row.attestation_time,
    expiration_time: row.expiration_time,
    metadata: row.metadata,
    block_number: row.block_number,
    definition: {
      badge_definition_id: row.badge_definition_id,
      name: row.name,
      description: row.description,
      revocable: row.revocable,
      block_number: row.block_number,
    },
  }));
}
