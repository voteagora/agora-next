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
