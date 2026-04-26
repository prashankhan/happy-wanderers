-- Multi-day tour metadata (backward compatible defaults)
ALTER TABLE "tours" ADD COLUMN "duration_days" integer NOT NULL DEFAULT 1;
ALTER TABLE "tours" ADD COLUMN "is_multi_day" boolean NOT NULL DEFAULT false;
ALTER TABLE "tours" ADD COLUMN "requires_accommodation" boolean NOT NULL DEFAULT false;
ALTER TABLE "tours" ADD CONSTRAINT "tours_duration_days_check" CHECK ("tours"."duration_days" >= 1 AND "tours"."duration_days" <= 30);

-- Booking span (mirrors booking_date for existing rows)
ALTER TABLE "bookings" ADD COLUMN "tour_start_date" date;
ALTER TABLE "bookings" ADD COLUMN "tour_end_date" date;
UPDATE "bookings" SET "tour_start_date" = "booking_date", "tour_end_date" = "booking_date" WHERE "tour_start_date" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "tour_start_date" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "tour_end_date" SET NOT NULL;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_date_span_check" CHECK ("tour_end_date" >= "tour_start_date");
