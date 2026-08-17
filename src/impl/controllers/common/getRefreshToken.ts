import { Request } from "express";

const getRefreshToken = (req: Request) => {
  const refreshToken = req.cookies.refreshToken;

  return refreshToken;
};
export default getRefreshToken;
