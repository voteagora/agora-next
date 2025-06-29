/**
 * Configuration for the new proposal system migration
 * Centralizes environment variable handling and feature flags
 */

export interface ProposalSystemConfig {
  useNewSystem: boolean;
  newSystemPercentage: number;
  enableSystemComparison: boolean;
  logLevel: "error" | "warn" | "info" | "debug";
  isEnabled: boolean;
}

/**
 * Get the current proposal system configuration from environment variables
 */
export function getProposalSystemConfig(): ProposalSystemConfig {
  const USE_NEW_PROPOSAL_SYSTEM =
    process.env.USE_NEW_PROPOSAL_SYSTEM === "true";
  const NEW_SYSTEM_PERCENTAGE = parseInt(
    process.env.NEW_SYSTEM_PERCENTAGE || "0"
  );
  const ENABLE_SYSTEM_COMPARISON =
    process.env.ENABLE_SYSTEM_COMPARISON === "true";
  const PROPOSAL_SYSTEM_LOG_LEVEL =
    process.env.PROPOSAL_SYSTEM_LOG_LEVEL || "info";

  // Validate percentage
  const validatedPercentage = Math.max(0, Math.min(100, NEW_SYSTEM_PERCENTAGE));

  // Validate log level
  const validLogLevels = ["error", "warn", "info", "debug"];
  const logLevel = validLogLevels.includes(PROPOSAL_SYSTEM_LOG_LEVEL)
    ? (PROPOSAL_SYSTEM_LOG_LEVEL as "error" | "warn" | "info" | "debug")
    : "info";

  // Determine if this request should use the new system
  const isEnabled =
    USE_NEW_PROPOSAL_SYSTEM &&
    (validatedPercentage >= 100 || Math.random() * 100 < validatedPercentage);

  return {
    useNewSystem: USE_NEW_PROPOSAL_SYSTEM,
    newSystemPercentage: validatedPercentage,
    enableSystemComparison: ENABLE_SYSTEM_COMPARISON,
    logLevel,
    isEnabled,
  };
}

/**
 * Logger for proposal system with configurable levels
 */
export class ProposalSystemLogger {
  private static logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  private static currentLevel: "error" | "warn" | "info" | "debug" = "info";

  static setLevel(level: "error" | "warn" | "info" | "debug") {
    this.currentLevel = level;
  }

  static error(message: string, data?: any) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.error) {
      console.error(`[ProposalSystem] ${message}`, data || "");
    }
  }

  static warn(message: string, data?: any) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.warn) {
      console.warn(`[ProposalSystem] ${message}`, data || "");
    }
  }

  static info(message: string, data?: any) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.info) {
      console.log(`[ProposalSystem] ${message}`, data || "");
    }
  }

  static debug(message: string, data?: any) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.debug) {
      console.debug(`[ProposalSystem] ${message}`, data || "");
    }
  }

  /**
   * Log system comparison data for monitoring
   */
  static logSystemComparison(data: {
    tenant: string;
    totalProposals: number;
    newSystemPercentage: number;
    filter?: string;
    type?: string;
    timestamp: number;
  }) {
    this.info("System comparison data", {
      ...data,
      source: "getProposals",
    });
  }

  /**
   * Log new system usage for tracking
   */
  static logNewSystemUsage(data: {
    tenant: string;
    proposalId: string;
    proposalType: string;
    isHybrid: boolean;
    timestamp: number;
  }) {
    this.debug("New system usage", data);
  }

  /**
   * Log fallback to old system for error tracking
   */
  static logFallbackToOldSystem(data: {
    tenant: string;
    proposalId: string;
    error: string;
    timestamp: number;
  }) {
    this.warn("Fallback to old system", data);
  }
}

/**
 * Metrics collection for proposal system performance
 */
export class ProposalSystemMetrics {
  private static metrics: {
    newSystemUsage: number;
    oldSystemUsage: number;
    fallbackCount: number;
    errors: number;
    lastReset: number;
  } = {
    newSystemUsage: 0,
    oldSystemUsage: 0,
    fallbackCount: 0,
    errors: 0,
    lastReset: Date.now(),
  };

  static incrementNewSystemUsage() {
    this.metrics.newSystemUsage++;
  }

  static incrementOldSystemUsage() {
    this.metrics.oldSystemUsage++;
  }

  static incrementFallbackCount() {
    this.metrics.fallbackCount++;
  }

  static incrementErrors() {
    this.metrics.errors++;
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static resetMetrics() {
    this.metrics = {
      newSystemUsage: 0,
      oldSystemUsage: 0,
      fallbackCount: 0,
      errors: 0,
      lastReset: Date.now(),
    };
  }

  /**
   * Get metrics summary for monitoring
   */
  static getMetricsSummary() {
    const total = this.metrics.newSystemUsage + this.metrics.oldSystemUsage;
    const newSystemPercentage =
      total > 0 ? (this.metrics.newSystemUsage / total) * 100 : 0;
    const errorRate = total > 0 ? (this.metrics.errors / total) * 100 : 0;
    const fallbackRate =
      this.metrics.newSystemUsage > 0
        ? (this.metrics.fallbackCount / this.metrics.newSystemUsage) * 100
        : 0;

    return {
      ...this.metrics,
      total,
      newSystemPercentage: Math.round(newSystemPercentage * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      fallbackRate: Math.round(fallbackRate * 100) / 100,
      uptime: Date.now() - this.metrics.lastReset,
    };
  }
}
