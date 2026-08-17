import { ZodIssue, ZodSchema } from "zod";

import { CanFail, er, ok } from "./canFail";

export const presentErrors = (norm: Array<ZodIssue>) => {
  return norm.reduce((acc: Record<string, any>, issue: ZodIssue) => {
    const key = issue.path.join(".");
    const value = [issue.message];
    acc[key] = value;
    return acc;
  }, {});
};

export const validateInput =
  <T>(schema: ZodSchema<T>) =>
  (input: T): CanFail<Record<string, any>, T> => {
    const result = schema.safeParse(input);

    if (!result.success) {
      const errs = presentErrors(result.error.issues);
      return er(errs);
    } else {
      return ok(result.data);
    }
  };
