import { encodeCursor } from "@/utils/cursor";
import productRepository from "./product.repository";
import { CustomError } from "@/utils/customErrors";

const productService = {
  async getProductById(companyId: string, storeId: string, id: string) {
    const product = await productRepository.findProductById({
      companyId,
      storeId,
      id,
    });

    if (!product) {
      throw new CustomError(404, "Product Not Found");
    }

    return product;
  },

  async getProducts(
    companyId: string,
    storeId: string,
    limit: number,
    cursor?: string,
  ) {
    const products = await productRepository.findProducts(
      companyId,
      storeId,
      limit,
      cursor,
    );
    const nextCursor =
      products.length === limit
        ? encodeCursor(products[products.length - 1].id)
        : null;
    return { products, nextCursor };
  },
};

export default productService;
