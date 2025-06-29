import { InvalidProposalIdError } from "../errors/ProposalErrors";

export class ProposalId {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new InvalidProposalIdError(value);
    }
  }

  private isValid(value: string): boolean {
    // Validate proposal ID format
    // Can be a number string or a hex string
    if (!value || value.trim() === "") {
      return false;
    }

    // Check if it's a valid number or hex
    const isNumber = /^\d+$/.test(value);
    const isHex = /^0x[0-9a-fA-F]+$/.test(value);

    return isNumber || isHex;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProposalId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
