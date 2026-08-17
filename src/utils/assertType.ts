export const assertType = <A, B extends A, C extends B>() => {};

// Intersection type behaviour
export type Intersection<T, U> = T extends U
  ? U extends T
    ? T
    : never
  : never;

type A = "a";
type P = "a" | "b" | "c";
type Q = "a" | "b";

type Nil = Intersection<Q, P>;
6;
