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

export const createOptionalNumberValidator = <T extends number>(
  max: T,
  min: T, 
  defaultValue: T
) => {
  return z
    .union([z.literal(null), z.number().min(min).max(max).default(defaultValue)])
    .transform((x) => (x !== null) ? x : defaultValue);
};