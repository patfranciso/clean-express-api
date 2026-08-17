import type { Express } from "express";
import { Send, Query, Params } from "express-serve-static-core";

export interface TypedRequestBody<T> extends Express.Request {
  [x: string]: any;
  body: T;
}

export interface TypedRequestQuery<T extends Query> extends Express.Request {
  query: T;
}
export interface TypedRequestParams<T extends Params> extends Express.Request {
  params: T;
}

export interface TypedRequest<T extends Query, U> extends Express.Request {
  cookies?: any;
  user?: any;
  body: U;
  query: T;
}

export interface TypedFullRequest<
  B,
  P extends Params,
  Q extends Query | undefined
> extends Express.Request {
  body: B;
  params: P;
  query: Q;
}

export interface TypedResponse<ResBody> extends Express.Response {
  json: Send<ResBody, this>;
  status: (n: number) => this;
  [key: string]: any;
}
