import { Request, Response } from "express";

import getRefreshToken from "../common/getRefreshToken";
import getUserAgent from "../common/getUserAgent";
import { refreshAccessTokenCommand } from "@/impl/commands/refreshAccessToken/refreshAccessToken.command";
import commandHandler from "@/impl/commands/commandHandler";

export async function refreshTokenController(req: Request, res: Response) {
  const refreshToken = getRefreshToken(req);
  const userAgent = getUserAgent(req);

  const handler = commandHandler(
    refreshAccessTokenCommand,
    "RefreshAccessToken"
  );
  const result = await handler({ userAgent, refreshToken });
  if (result.status !== "success") {
    return res
      .status(400)
      .json({ errors: { message: "Could not renew token" } });
    // return res.status(400).json({ errors: { message: result.meta } });
  }
  return res.json({ data: result.data });
}
