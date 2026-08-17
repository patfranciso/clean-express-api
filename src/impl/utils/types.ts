export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> &
  { [K in Keys]: Required<Pick<T, K>> }[Keys];

export type TResponse<Goody, Err> =
  | {
      statusCode: 200 | 201;
      data: Goody;
    }
  | {
      statusCode: 400 | 401 | 403 | 404 | 500;
      errors: Err;
    };
