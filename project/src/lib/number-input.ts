import { z } from "zod";

export function parseNumericInput(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  return Number(value.replace(",", "."));
}

export const numericInputSchema = z.union([z.number(), z.string()]).transform((value) => parseNumericInput(value));
