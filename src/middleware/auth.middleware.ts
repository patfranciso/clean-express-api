import { TypedRequest, TypedResponse } from "@/infrastructure/types/express";
import { NextFunction } from "express";
import { authCheck } from "@/application/usecases/middleware/authCheck";

const authMiddleware = async (
  req: TypedRequest<{}, { cookies: { token: string } }>,
  res: TypedResponse<{}>,
  next: NextFunction
) => {
  const token = req.cookies.token;
  const { user, error } = authCheck(token);

  if (error) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  req.user = user;
  next();
};

export default authMiddleware;
