import { DelegateStatements } from "@prisma/client";

export type DelegateStatementWithDynamoDB = Omit<DelegateStatements, 'createdAt' | 'updatedAt' | 'signature' | 'dao_slug'>;
