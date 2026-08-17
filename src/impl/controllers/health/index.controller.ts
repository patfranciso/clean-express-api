import {
  TypedRequestQuery,
  TypedResponse,
} from "@/infrastructure/types/express";

export async function healthController(
  req: TypedRequestQuery<{ query: string }>,
  res: TypedResponse<{ msg: string; params: Record<string, any> }>
) {
  const params = req.query;
  return res.json({ msg: "Welcome", params });
}
