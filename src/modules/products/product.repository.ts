import { prisma } from "@/db";

const productRepository = {
  async findProductById({
    companyId,
    storeId,
    id,
  }: {
    companyId: string;
    storeId: string;
    id: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT set_config(
          'app.tenant_id',
          ${companyId},
          true
        )
      `;

      return tx.product.findFirst({
        where: {
          id,
          companyId,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          imageUrl: true,
          description: true,

          inventories: {
            where: {
              companyId,
              storeId,
            },
            select: {
              qty: true,
              reservedQty: true,
              uom: true,
            },
          },

          prices: {
            where: {
              companyId,
              storeId,
            },
            select: {
              price: true,
            },
          },
        },
      });
    });
  },
};

export default productRepository;
