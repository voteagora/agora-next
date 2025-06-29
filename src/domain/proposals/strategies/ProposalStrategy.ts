import {
  ProposalData,
  ProposalResults,
  ProposalMetrics,
  ProposalStatus,
} from "../types";
import { Proposal } from "../entities/Proposal";

export interface ProposalStrategy {
  /**
   * Parse raw proposal data from the database/API into domain-specific format
   */
  parseData(rawData: any): ProposalData;

  /**
   * Parse raw voting results into domain-specific format
   * @param rawResults Raw voting results from database/API
   * @param proposalData Optional proposal data for context (hybrid proposals)
   */
  parseResults(rawResults: any, proposalData?: any): ProposalResults;

  /**
   * Calculate proposal metrics like quorum and approval rates
   */
  calculateMetrics(proposal: Proposal): ProposalMetrics;

  /**
   * Determine the current status of the proposal
   */
  determineStatus(proposal: Proposal): ProposalStatus;

  /**
   * Validate proposal data according to type-specific rules
   */
  validateData(data: ProposalData): boolean;

  /**
   * Get human-readable description of the proposal type
   */
  getTypeDescription(): string;
}
