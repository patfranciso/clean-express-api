import { Request, Response } from "express";

import getUserAgent from "../common/getUserAgent";
import { logoutCommand } from "@/impl/commands/logout/logout.command";
import getRefreshToken from "../common/getRefreshToken";
import commandHandler from "@/impl/commands/commandHandler";

export async function logoutController(req: Request, res: Response) {
  const refreshToken = getRefreshToken(req);
  const userAgent = getUserAgent(req);

  const handler = commandHandler(logoutCommand, "Logout");
  const result = await handler({ userAgent, refreshToken });
  if (result.status === "failed") {
    return res.status(400).json({ errors: { message: result.errors.message } });
  } else if (result.status === "error") {
    return res.status(500).json({ errors: { message: result.errors.message } });
  } else {
    return res.json({ data: result.data });
  }
}
