import { Router } from "express";
import { userRouter, authRouter } from "@/modules";
import { verifyTokenMiddleware } from "@/middlewares/authorization.middleware";

const router = Router();

router.use("/v1/auth", authRouter);

router.use("/v1/user", verifyTokenMiddleware, userRouter);

export default router;
