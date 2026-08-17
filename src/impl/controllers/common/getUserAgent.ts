import { Request } from "express";
import _ from "lodash";

const getUserAgent = (req: Request) => {
  return req.get("user-agent") || "";
};
export default getUserAgent;
