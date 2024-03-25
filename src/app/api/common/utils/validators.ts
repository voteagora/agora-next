import { ZodError, z } from "zod";

/*
  Creates a zod schema for validating input against a list of string literals.
  If input is null or empty string, returns the supplied default value.
*/
export const createOptionalStringValidator = <T extends string>(
  inputs: T[],
  defaultValue: T
) => {
  const literals = inputs.map((x) => z.literal(x)) as unknown as readonly [
    z.ZodLiteral<T>,
    z.ZodLiteral<T>,
    ...z.ZodLiteral<T>[]
  ];
  return z
    .union([z.literal(null), z.literal(""), z.literal(defaultValue), ...literals])
    .transform((x) => (x !== null && x !== "") ? x : defaultValue);
};

/*
  Creates a zod schema for validating input against min and max number values.
  If input is null, returns the supplied default value.
*/
export const createOptionalNumberValidator = (
  min: number, 
  max: number,
  defaultValue: number
) => {
  return z
    .union([
      z.literal(null), 
      z.string().transform(x => parseInt(x)).refine(x => x >= min).refine(x => x <= max),
      z.number().min(min).max(max).default(defaultValue)])
    .transform((x) => (x !== null) ? x : defaultValue);
};