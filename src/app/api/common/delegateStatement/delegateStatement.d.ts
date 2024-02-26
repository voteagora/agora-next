import { DelegateStatements } from "@prisma/client";

export type DelegateStatement = Omit<DelegateStatements, 'createdAt' | 'updatedAt' | 'signature' | 'dao_slug'>;
