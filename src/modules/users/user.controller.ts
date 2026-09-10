import { NextFunction, Request, Response } from "express";
import { UserCreateDto, userCreateSchema } from "./user.schema";
import { userService } from "./user.service";

export async function createUser(
  req: Request<null, null, UserCreateDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = userCreateSchema.parse(req.body);

    const data = await userService.createUser(user);

    return res.status(201).json({
      data,
    });
  } catch (err) {
    next(err);
  }
}
