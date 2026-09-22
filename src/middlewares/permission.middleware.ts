import { authService } from "@/modules/auth/auth.service";
import { CustomError } from "@/utils/customErrors";
import { NextFunction, Response, Request } from "express";

export const permissionMiddleware = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.roleId) {
        return next(new CustomError(401, "Role context missing"));
      }

      await authService.isAllowed(req.roleId, permissions);

      next();
    } catch (err) {
      next(err);
    }
  };
};
