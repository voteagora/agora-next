import { ProposalType } from "../types";

export class ProposalDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidProposalIdError extends ProposalDomainError {
  constructor(id: string) {
    super(`Invalid proposal ID: ${id}`, "INVALID_PROPOSAL_ID");
  }
}

export class InvalidProposalDataError extends ProposalDomainError {
  constructor(type: ProposalType, details: string) {
    super(
      `Invalid data for proposal type ${type}: ${details}`,
      "INVALID_PROPOSAL_DATA"
    );
  }
}

export class UnknownProposalTypeError extends ProposalDomainError {
  constructor(type: string) {
    super(`Unknown proposal type: ${type}`, "UNKNOWN_PROPOSAL_TYPE");
  }
}

export class ProposalCalculationError extends ProposalDomainError {
  constructor(proposalId: string, calculation: string, error: string) {
    super(
      `Failed to calculate ${calculation} for proposal ${proposalId}: ${error}`,
      "CALCULATION_ERROR"
    );
  }
}

export class ProposalNotFoundError extends ProposalDomainError {
  constructor(id: string) {
    super(`Proposal not found: ${id}`, "PROPOSAL_NOT_FOUND");
  }
}

export class ProposalValidationError extends ProposalDomainError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR");
  }
}
