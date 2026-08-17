import { Request } from "express";
import _ from "lodash";

const getAccessToken = (req: Request) => {
  return _.get(req, "headers.authorization", "").replace(/^Bearer\s/, "");
};
export default getAccessToken;
