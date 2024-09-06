import { CATEGORY_ROLES } from "@/app/lib/auth/constants";
import { cache } from "react";

export async function isBadgeholder(address: string) {
  // TODO: implement. This method makes a distinction between badgeholders and citizens
  // for viewing and voting on ballots

  // TODO: return badgeholder date including round & category

  return true;
}

export function votingCategory(address: string) {
  // get a number seeded by the address
  const seed = parseInt(address.slice(2, 10), 16);
  const categoryIndex = seed % Object.keys(CATEGORY_ROLES).length;
  return Object.entries(CATEGORY_ROLES)[categoryIndex][1];
}
