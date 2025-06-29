import { ProposalType } from "../types";
import { ProposalTypeConfig } from "./ProposalTypeConfig";
import { UnknownProposalTypeError } from "../errors/ProposalErrors";
import { ProposalStrategy } from "../strategies/ProposalStrategy";

export class ProposalTypeRegistry {
  private static instance: ProposalTypeRegistry;
  private types = new Map<ProposalType, ProposalTypeConfig>();

  private constructor() {}

  static getInstance(): ProposalTypeRegistry {
    if (!ProposalTypeRegistry.instance) {
      ProposalTypeRegistry.instance = new ProposalTypeRegistry();
    }
    return ProposalTypeRegistry.instance;
  }

  register(config: ProposalTypeConfig): void {
    this.types.set(config.type, config);
  }

  getConfig(type: ProposalType): ProposalTypeConfig {
    const config = this.types.get(type);
    if (!config) {
      throw new UnknownProposalTypeError(type);
    }
    return config;
  }

  getStrategy(type: ProposalType): ProposalStrategy {
    return this.getConfig(type).strategy;
  }

  getAllTypes(): ProposalType[] {
    return Array.from(this.types.keys());
  }

  hasType(type: string): boolean {
    return this.types.has(type as ProposalType);
  }

  clear(): void {
    this.types.clear();
  }
}
