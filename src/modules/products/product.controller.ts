import { Request, Response, NextFunction } from "express";
import productService from "./product.service";

export async function fetchProductById(
  req: Request<{ storeId: string; productId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { productId, storeId } = req.params;

    const product = await productService.getProductById(
      req.tenantId,
      storeId,
      productId,
    );
    res.status(200).json({
      data: product,
    });
  } catch (err) {
    next(err);
  }
}
