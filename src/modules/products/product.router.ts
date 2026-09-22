import { Router } from "express";
import { fetchProductById } from "./product.controller";
import { permissionMiddleware } from "@/middlewares";

export const productRouter = Router();

productRouter.get(
  "/:storeId/products/:productId",
  permissionMiddleware(["product.read"]),
  fetchProductById,
);
