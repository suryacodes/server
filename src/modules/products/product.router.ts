import { Router } from "express";
import { fetchProductById, fetchProducts } from "./product.controller";
import { permissionMiddleware } from "@/middlewares";

export const productRouter = Router();

productRouter.get(
  "/:storeId/products/:productId",
  permissionMiddleware(["product.read"]),
  fetchProductById,
);

productRouter.get(
  "/:storeId/products",
  permissionMiddleware(["product.read"]),
  fetchProducts,
);
