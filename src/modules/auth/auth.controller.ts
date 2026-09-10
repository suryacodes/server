import { NextFunction, Request, Response } from "express";
import { loginSchema, LoginSchema } from "./auth.schema";
import { authService } from "./auth.service";
import { REFRESH_TOKEN_TTL } from "@/config/constants";

export async function login(
  req: Request<null, null, LoginSchema>,
  res: Response,
  next: NextFunction,
) {
  try {
    const cred = loginSchema.parse(req.body);
    const result = await authService.login(cred);

    if (req.headers["x-client-type"] === "mobile") {
      return res.status(200).json({ data: result });
    }

    const { refreshToken, ...rest } = result;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(201).json({ data: rest });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tokens = await authService.rotateRefreshToken(
      req.refreshTokenJti,
      req.userId,
    );

    if (req.headers["x-client-type"] === "mobile") {
      return res.status(200).json({ data: tokens });
    }

    const { refreshToken, accessToken } = tokens;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}
