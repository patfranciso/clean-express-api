export type CanFail<BadNews, GoodResult> = Er<BadNews> | Ok<GoodResult>;

export type Er<BadNews> = { tag: "er"; err: BadNews };

export type Ok<GoodResult> = { tag: "ok"; value: GoodResult };

export const resolve = <BadNews, GoodResult>(
  result: CanFail<BadNews, GoodResult>
): BadNews | GoodResult => {
  return result.tag === "er" ? result.err : result.value;
};

export const isOk = <B, G>(result: CanFail<B, G>): boolean =>
  result.tag === "ok";

export const isEr = <B, T>(result: CanFail<B, T>): result is Er<B> =>
  result.tag === "er";

export const ok = <Goody>(input: Goody): Ok<Goody> => ({
  tag: "ok",
  value: input,
});

export const er = <Baddie>(input: Baddie): Er<Baddie> => ({
  tag: "er",
  err: input,
});
