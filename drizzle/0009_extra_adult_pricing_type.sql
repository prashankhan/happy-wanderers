ALTER TABLE "pricing_rules"
ADD COLUMN "extra_adult_pricing_type" text NOT NULL DEFAULT 'fixed';

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_extra_adult_type_check"
CHECK ("pricing_rules"."extra_adult_pricing_type" IN ('fixed', 'not_allowed'));
