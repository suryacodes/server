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

  findProducts(
    companyId: string,
    storeId: string,
    limit: number,
    cursor?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${companyId}, true)`;

      return tx.product.findMany({
        where: {
          companyId,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          imageUrl: true,
          description: true,
          prices: {
            where: { storeId },
            select: { price: true },
          },
          inventories: {
            where: { storeId },
            select: {
              qty: true,
              reservedQty: true,
              uom: true,
            },
          },
        },
        ...(cursor && {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }),
        orderBy: {
          id: "asc",
        },
        take: limit,
      });
    });
  },
};

export default productRepository;
