-- CreateEnum
CREATE TYPE "UnitOfMeasure" AS ENUM ('PCS', 'KG', 'G', 'L', 'ML', 'BOX');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" BIGSERIAL NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" BIGSERIAL NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,
    "uom" "UnitOfMeasure" NOT NULL,
    "reserved_qty" DECIMAL(12,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_company_id_name_idx" ON "products"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "products"("company_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "prices_company_id_store_id_product_id_key" ON "prices"("company_id", "store_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_company_id_store_id_product_id_key" ON "inventory"("company_id", "store_id", "product_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
