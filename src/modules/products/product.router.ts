import { Router } from "express";
import { fetchProductById } from "./product.controller";

export const productRouter = Router();

productRouter.get("/:storeId/products/:productId", fetchProductById);
