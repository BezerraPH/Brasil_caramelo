-- Pet shops parceiros com geo (R-MON-02)
ALTER TABLE "PetShopCoupon" ADD COLUMN "city" TEXT;
ALTER TABLE "PetShopCoupon" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "PetShopCoupon" ADD COLUMN "address" TEXT;
ALTER TABLE "PetShopCoupon" ADD COLUMN "lat" DOUBLE PRECISION;
ALTER TABLE "PetShopCoupon" ADD COLUMN "lng" DOUBLE PRECISION;
ALTER TABLE "PetShopCoupon" ADD COLUMN "phone" TEXT;
ALTER TABLE "PetShopCoupon" ADD COLUMN "partnerUrl" TEXT;

CREATE INDEX "PetShopCoupon_city_active_idx" ON "PetShopCoupon"("city", "active");

UPDATE "PetShopCoupon" SET
  "city" = 'Recife',
  "neighborhood" = 'Boa Viagem',
  "address" = 'Av. Boa Viagem, 1200 — Recife, PE',
  "lat" = -8.1264,
  "lng" = -34.9044,
  "phone" = '(81) 3000-1001',
  "partnerUrl" = 'https://maps.google.com/?q=Pet+Center+Boa+Viagem+Recife'
WHERE "id" = 'demo_recife_1';

UPDATE "PetShopCoupon" SET
  "city" = 'Recife',
  "neighborhood" = 'Olinda',
  "address" = 'Rua do Sol, 45 — Olinda, PE',
  "lat" = -8.0089,
  "lng" = -34.8553,
  "phone" = '(81) 3000-1002',
  "partnerUrl" = 'https://maps.google.com/?q=Cao+Gato+Olinda'
WHERE "id" = 'demo_recife_2';

UPDATE "PetShopCoupon" SET
  "city" = 'Caruaru',
  "neighborhood" = 'Centro',
  "address" = 'Av. Agamenon Magalhães, 200 — Caruaru, PE',
  "lat" = -8.2832,
  "lng" = -35.9722,
  "phone" = '(81) 3701-2000',
  "partnerUrl" = 'https://maps.google.com/?q=AgroPet+Caruaru'
WHERE "id" = 'demo_caruaru_1';

INSERT INTO "PetShopCoupon" (
  "id", "region", "city", "neighborhood", "address", "lat", "lng",
  "phone", "partnerUrl", "shopName", "title", "code", "coinCost", "active"
) VALUES
  (
    'demo_recife_3', 'Recife', 'Recife', 'Madalena',
    'Rua da Hora, 88 — Madalena, Recife, PE', -8.0582, -34.9058,
    '(81) 3000-1003', 'https://maps.google.com/?q=Pet+Love+Madalena+Recife',
    'Pet Love Madalena', 'Kit filhote -20%', 'BC-MAD20', 150, true
  ),
  (
    'demo_caruaru_2', 'Caruaru', 'Caruaru', 'Petrópolis',
    'Rua 15 de Novembro, 310 — Petrópolis, Caruaru, PE', -8.2711, -35.9788,
    '(81) 3701-2010', 'https://maps.google.com/?q=Vet+Caramelo+Caruaru',
    'Vet Caramelo Petrópolis', 'Consulta -10%', 'BC-VET10', 100, true
  )
ON CONFLICT ("id") DO NOTHING;
