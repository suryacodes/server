import { CustomError } from "@/utils/customErrors";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";
import { NextFunction, Request, Response } from "express";

export const verifyTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.get("Authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new CustomError(401, "Missing authorization header"));
  }

  const token = authorizationHeader.split(" ")[1];

  const payload = verifyAccessToken(token);
  if (!payload.sub) {
    return next(new CustomError(401, "Invalid access token"));
  }

  req.userId = payload.sub;
  req.tenantId = payload.tenantId;
  req.roleId = payload.roleId;

  next();
};

export const verifyRefreshTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let refreshToken: string | undefined;

  if (req.headers["x-client-type"] === "mobile") {
    const token = req.headers["x-refresh-token"];

    if (typeof token === "string") {
      refreshToken = token;
    }
  } else {
    refreshToken = req.cookies?.refreshToken;
  }

  if (!refreshToken) {
    return next(new CustomError(401, "Refresh token missing"));
  }

  const { sub, jti } = verifyRefreshToken(refreshToken);

  if (!sub || !jti) {
    return next(new CustomError(401, "Invalid refresh token"));
  }

  req.userId = sub;
  req.refreshTokenJti = jti;

  next();
};
