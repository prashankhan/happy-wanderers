ALTER TABLE "pricing_rules"
ADD COLUMN "pricing_mode" text NOT NULL DEFAULT 'per_person',
ADD COLUMN "included_adults" integer NOT NULL DEFAULT 2,
ADD COLUMN "package_base_price" numeric(12,2) NOT NULL DEFAULT '0',
ADD COLUMN "extra_adult_price" numeric(12,2) NOT NULL DEFAULT '0',
ADD COLUMN "extra_child_price" numeric(12,2) NOT NULL DEFAULT '0',
ADD COLUMN "min_guests" integer NOT NULL DEFAULT 1,
ADD COLUMN "max_guests" integer NOT NULL DEFAULT 12,
ADD COLUMN "max_infants" integer;

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_mode_check" CHECK ("pricing_mode" IN ('per_person', 'package'));

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_included_adults_min_check" CHECK ("included_adults" >= 1);

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_min_guests_check" CHECK ("min_guests" >= 1);

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_max_guests_check" CHECK ("max_guests" >= "min_guests");

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_max_infants_nonneg_check" CHECK ("max_infants" IS NULL OR "max_infants" >= 0);
