import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";

export interface DelegateFilters {
  delegator?: `0x${string}`;
  issues?: string;
  stakeholders?: string;
  hasStatement?: boolean;
  endorsed?: boolean;
}

/**
 * Builds a filters object from the parsed nuqs params
 * @param parsedParams The parsed search parameters from nuqs
 * @returns A filters object for the delegates API
 */
export function buildDelegateFilters(
  parsedParams: Record<string, any>
): DelegateFilters {
  const { ui } = Tenant.current();
  const filters: DelegateFilters = {};

  // Safely add filters only if they exist
  if (parsedParams[MY_DELEGATES_FILTER_PARAM]) {
    filters.delegator = parsedParams[
      MY_DELEGATES_FILTER_PARAM
    ] as `0x${string}`;
  }

  if (
    parsedParams[ISSUES_FILTER_PARAM] &&
    Array.isArray(parsedParams[ISSUES_FILTER_PARAM]) &&
    parsedParams[ISSUES_FILTER_PARAM].length > 0
  ) {
    filters.issues = parsedParams[ISSUES_FILTER_PARAM].join(",");
  }

  if (
    parsedParams[STAKEHOLDERS_FILTER_PARAM] &&
    Array.isArray(parsedParams[STAKEHOLDERS_FILTER_PARAM]) &&
    parsedParams[STAKEHOLDERS_FILTER_PARAM].length > 0
  ) {
    filters.stakeholders = parsedParams[STAKEHOLDERS_FILTER_PARAM].join(",");
  }

  if (parsedParams[HAS_STATEMENT_FILTER_PARAM]) {
    filters.hasStatement = Boolean(parsedParams[HAS_STATEMENT_FILTER_PARAM]);
  }

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  if (endorsedToggle?.enabled && endorsedToggle.config) {
    const defaultFilter = (endorsedToggle.config as UIEndorsedConfig)
      .defaultFilter;
    filters.endorsed =
      parsedParams[ENDORSED_FILTER_PARAM] === undefined
        ? defaultFilter
        : Boolean(parsedParams[ENDORSED_FILTER_PARAM]);
  }

  return filters;
}
