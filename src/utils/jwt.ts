import { env } from "@/config/env";
import jwt from "jsonwebtoken";
import { CustomError } from "./customErrors";

export const generateAccessToken = (
  userId: string,
  companyId: string,
  roleId: string,
) => {
  return jwt.sign(
    {
      tenantId: companyId,
      roleId,
    },
    env.ACCESS_TOKEN_SECRET_KEY,
    {
      subject: userId,
      expiresIn: "15m",
    },
  );
};

export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);

    if (typeof decoded === "string" || !decoded.sub) {
      throw new CustomError(401, "Invalid access token");
    }

    return decoded;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(401, "Invalid or expired access token");
  }
};

export const generateRefreshToken = (
  userId: string,
  jti: string,
  expiresAt: Date,
) => {
  return jwt.sign({}, env.REFRESH_TOKEN_SECRET_KEY, {
    subject: userId,
    expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    jwtid: jti,
  });
};

export const verifyRefreshToken = (
  token: string,
): { sub: string; jti: string } => {
  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET_KEY);

    if (typeof decoded === "string" || !decoded.sub || !decoded.jti) {
      throw new CustomError(401, "Invalid Refresh token");
    }

    return { sub: decoded.sub, jti: decoded.jti! };
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(401, "Invalid or expired Refresh token");
  }
};
