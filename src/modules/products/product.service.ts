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
};

export default productService;
