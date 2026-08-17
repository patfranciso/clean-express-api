export type Hasher = (plaintext: string) => Promise<string>;
export type HashComparer = (
  plaitext: string,
  digest: string
) => Promise<boolean>;
export type Hash = (obj: any, meta?: string) => string;
