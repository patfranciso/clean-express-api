// import {type Response} from "express";

import getCookieValue from "@/utils/getCookieValue";

export default function getCookieFromResponse(
  response: unknown,
  cookieKey: string
) {
  // @ts-ignore
  const setCookieHeaders = response.headers["set-cookie"];
  //   const setCookieHeaders = response.headers.getSetCookie();

  // getCookieFromResponse(response,cookieKey)
  return getCookieValue(setCookieHeaders, cookieKey) || "";
}
