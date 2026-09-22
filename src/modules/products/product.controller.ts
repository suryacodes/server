import { Request, Response, NextFunction } from "express";
import productService from "./product.service";
import { productListQuerySchema } from "./product.schema";
import { decodeCursor } from "@/utils/cursor";

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

export async function fetchProducts(
  req: Request<
    { storeId: string },
    {},
    {},
    { cursor?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { storeId } = req.params;

    let { cursor, limit } = productListQuerySchema.parse({
      cursor: req.query.cursor,
      limit: Number(req.query.limit ?? 10),
    });

    const currentCursor = cursor ? decodeCursor(cursor).id : undefined;

    const { products, nextCursor } = await productService.getProducts(
      req.tenantId,
      storeId,
      limit,
      currentCursor,
    );

    res.status(200).json({
      data: { products, nextCursor },
    });
  } catch (err) {
    next(err);
  }
}
