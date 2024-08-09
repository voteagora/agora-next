import { Prisma } from "@prisma/client";

export type Project = {
  id: string;
  category: string | null;
  name: string | null;
  description: string | null;
  profileAvatarUrl: string | null;
  proejctCoverImageUrl: string | null;
  socialLinks: {
    twitter: string | null;
    farcaster: Prisma.JsonValue;
    mirror: string | null;
    website: Prisma.JsonValue;
  };
  team: Prisma.JsonValue;
  github: Prisma.JsonValue;
  packages: Prisma.JsonValue;
  contracts: Prisma.JsonValue;
  grantsAndFunding: {
    ventureFunding: Prisma.JsonValue;
    grants: Prisma.JsonValue;
    revenue: Prisma.JsonValue;
  };
};
