import { prisma } from "@/db";

const inventoryRepository = {
  updateInventory(companyId: string, storeId: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT set_config(
          'app.tenant_id',
          ${companyId},
          true
        )
      `;

      const result = await tx.$queryRaw<
        Array<{
          id: bigint;
          company_id: string;
          store_id: string;
          product_id: string;
          qty: string;
          reserved_qty: string;
          uom: string;
        }>
      >`
        SELECT
          id,
          company_id,
          store_id,
          product_id,
          qty,
          reserved_qty,
          uom
        FROM inventory
        WHERE company_id = ${companyId}
          AND store_id = ${storeId}
          AND product_id = ${productId}
        FOR UPDATE
      `;

      if (result.length === 0) {
        throw new Error("Inventory not found");
      }

      const inventory = result[0];

      await tx.inventory.update({
        where: {
          companyId_storeId_productId: {
            companyId,
            storeId,
            productId,
          },
        },
        data: {
          qty: {
            decrement: 1,
          },
        },
      });

      return inventory;
    });
  },
};

export default inventoryRepository;
