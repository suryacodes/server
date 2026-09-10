import { Router } from "express";
import { login } from "./auth.controller";
import { verifyRefreshTokenMiddleware } from "@/middlewares/authorization.middleware";
import { refreshToken } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/refresh", verifyRefreshTokenMiddleware, refreshToken);
