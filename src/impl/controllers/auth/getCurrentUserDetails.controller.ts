import { Request, Response } from "express";

import getUserAgent from "../common/getUserAgent";
import getAccessToken from "../common/getAccessToken";
import { getCurrentUserDetailsCommand } from "@/impl/commands/getCurrentDetails/getCurrentUserDetails.command";

export async function getCurrentUserDetailsController(
  req: Request,
  res: Response
) {
  let sessionId = req.cookies.key || "";
  if (Array.isArray(sessionId)) sessionId = sessionId[0];
  const accessToken = getAccessToken(req);
  const userAgent = getUserAgent(req);
  const result = await getCurrentUserDetailsCommand({
    sessionId,
    accessToken,
    userAgent,
  });

  if (result.status !== "success") {
    return res.status(400).json({
      status: result.status,
      errors: result.errors,
    });
  }
  return res.status(200).json({
    status: result.status,
    data: result.data,
  });
}
