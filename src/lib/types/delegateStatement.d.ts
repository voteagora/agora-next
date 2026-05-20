import { DelegateStatements } from "@prisma/client";

export type DelegateStatement = {
  address: string;
  dao_slug: string;
  message_hash: string;
  signature: string;
  payload: any;
  twitter: string | null;
  warpcast: string | null;
  discord: string | null;
  scw_address: string | null;
  notification_preferences: any;
  endorsed: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  created_at_ts: Date | null;
  updated_at_ts: Date | null;
  stage: string | null;
};
