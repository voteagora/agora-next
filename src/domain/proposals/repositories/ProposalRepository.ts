import { Proposal } from "../entities/Proposal";
import { ProposalId } from "../value-objects/ProposalId";
import { SearchCriteria, PaginatedResult } from "../types";

export interface ProposalRepository {
  /**
   * Find a proposal by its ID
   */
  findById(id: ProposalId): Promise<Proposal | null>;

  /**
   * Find multiple proposals by their IDs
   */
  findByIds(ids: ProposalId[]): Promise<Proposal[]>;

  /**
   * Find proposals matching the given criteria
   */
  findMany(criteria: SearchCriteria): Promise<PaginatedResult<Proposal>>;

  /**
   * Save a proposal
   */
  save(proposal: Proposal): Promise<void>;

  /**
   * Save multiple proposals
   */
  saveMany(proposals: Proposal[]): Promise<void>;

  /**
   * Get the total count of proposals matching criteria
   */
  count(criteria: SearchCriteria): Promise<number>;

  /**
   * Check if a proposal exists
   */
  exists(id: ProposalId): Promise<boolean>;
}
