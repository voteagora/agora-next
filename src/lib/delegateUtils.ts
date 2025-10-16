/**
 * Utility functions for working with delegate statements
 */

export interface DelegateStatementPayload {
  delegateStatement: string;
}

export interface DelegateStatement {
  payload?: DelegateStatementPayload | Record<string, unknown>;
  twitter?: string;
  discord?: string;
  warpcast?: string;
}

export interface Delegate {
  address: string;
  statement?: DelegateStatement;
  votingPower?: {
    total: string;
  };
}

/**
 * Extracts the delegate statement text from a delegate object
 * @param delegate - The delegate object
 * @returns The delegate statement string or null if not found
 */
export function getDelegateStatement(
  delegate: Delegate | null | undefined
): string | null {
  if (!delegate?.statement?.payload) {
    return null;
  }

  const payload = delegate.statement.payload as DelegateStatementPayload;
  return payload.delegateStatement || null;
}

/**
 * Checks if a delegate has a statement
 * @param delegate - The delegate object
 * @returns True if the delegate has a statement, false otherwise
 */
export function hasDelegateStatement(
  delegate: Delegate | null | undefined
): boolean {
  const statement = getDelegateStatement(delegate);
  return statement !== null && statement.trim().length > 0;
}

/**
 * Gets a truncated version of the delegate statement
 * @param delegate - The delegate object
 * @param maxLength - Maximum length of the truncated statement (default: 120)
 * @returns Truncated statement or empty string if no statement exists
 */
export function getTruncatedStatement(
  delegate: Delegate | null | undefined,
  maxLength: number = 120
): string {
  const statement = getDelegateStatement(delegate);
  if (!statement) {
    return "";
  }

  return statement.length > maxLength
    ? statement.slice(0, maxLength)
    : statement;
}
