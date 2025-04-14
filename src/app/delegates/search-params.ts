import {
  parseAsBoolean,
  parseAsString,
  parseAsArrayOf,
  createLoader,
  createSerializer,
} from "nuqs/server";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";

// Define the empty array constant to maintain reference equality
const emptyArray: string[] = [];

// Describe search params configuration
export const delegatesSearchParams = {
  [ENDORSED_FILTER_PARAM]: parseAsBoolean.withDefault(false),
  [HAS_STATEMENT_FILTER_PARAM]: parseAsBoolean.withDefault(false),
  [MY_DELEGATES_FILTER_PARAM]: parseAsString.withDefault(""),
  [ISSUES_FILTER_PARAM]: parseAsArrayOf(parseAsString).withDefault(emptyArray),
  [STAKEHOLDERS_FILTER_PARAM]:
    parseAsArrayOf(parseAsString).withDefault(emptyArray),
  tab: parseAsString.withDefault("delegates"),
  orderBy: parseAsString.withDefault("weighted_random"),
  citizensOrderBy: parseAsString.withDefault("shuffle"),
};

// Create the loader function for server components
export const loadDelegatesSearchParams = createLoader(delegatesSearchParams);

// Create the serializer for client components
export const delegatesSearchParamsSerializer = createSerializer(
  delegatesSearchParams
);
