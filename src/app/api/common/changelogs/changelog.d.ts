import { DaoSlug } from "@prisma/client";

export type Changelog = {
  id: number;
  dao_slug: DaoSlug;
  title: string;
  body: string;
  author_address: string;
  created_at: Date;
  updated_at: Date;
};
