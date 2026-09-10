import { Prisma } from "@/generated/prisma/client";
import { CustomError } from "@/utils/customErrors";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: false,
      message: "Validation Error",
      data: null,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: false,
      message: "Invalid Data",
      data: null,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: false,
        message: "Data already exists",
        data: null,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Record not found",
        data: null,
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        status: false,
        message: "Related record does not exist",
        data: null,
      });
    }
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
    data: null,
  });
}
