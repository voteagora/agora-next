/*
 * TanStack Start equivalent of src/app/admin/actions.ts.
 *
 * `createServerFn` replaces the `"use server"` action pattern. Call sites in
 * the new TanStack pages will use `await fetchProposalTypes()`. The Next
 * action file remains for the Next build until Phase F cutover.
 */

import { createServerFn } from "@tanstack/react-start";

import { fetchProposalTypes as apiFetchPropTyposales } from "@/app/api/common/proposals/getProposals";

export const fetchProposalTypes = createServerFn({ method: "GET" }).handler(
  async () => apiFetchPropTyposales()
);
