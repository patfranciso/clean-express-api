export type Transformer<T> = (obj: T | Partial<T>) => Partial<T>;
