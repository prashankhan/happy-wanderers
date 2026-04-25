ALTER TABLE "tours"
ADD COLUMN "minimum_advance_booking_days" integer NOT NULL DEFAULT 0;

ALTER TABLE "tours"
ADD CONSTRAINT "tours_minimum_advance_booking_days_check"
CHECK ("tours"."minimum_advance_booking_days" >= 0 AND "tours"."minimum_advance_booking_days" <= 365);
