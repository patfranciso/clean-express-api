import { v4 } from "uuid";

import { logger } from "@/utils/logger";

type Command<T, U> = (x: T) => Promise<U>;
function commandHandler<Input, Result>(
  command: Command<Input, Result>,
  errorMessage: string | ((er: Error) => Result),
  payload: {} = {}
): Command<Input, Result> {
  return async (input: Input) => {
    try {
      const result: Result = await command(input);
      return result;
    } catch (err: unknown) {
      if (typeof errorMessage === "string") {
        const eid = v4();
        logger.error(
          JSON.stringify({
            type: "Error",
            id: eid,
            error: (err as unknown as Error).message,
            stackTrace: new Error().stack,
            payload: Object.keys(payload).length > 0 ? payload : undefined,
          })
        );
        return {
          status: "error",
          meta: `${errorMessage}UnexpectedError`,
          errors: {
            message: `Unexpected ${errorMessage} Error with Code: '${eid}'`,
          },
          payload: Object.keys(payload).length > 0 ? payload : undefined,
        } as Result;
      } else {
        return errorMessage(err as unknown as Error);
      }
    }
  };
}

export default commandHandler;
