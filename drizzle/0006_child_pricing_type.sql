ALTER TABLE "pricing_rules"
ADD COLUMN "child_pricing_type" text NOT NULL DEFAULT 'fixed';

ALTER TABLE "pricing_rules"
ADD CONSTRAINT "pricing_rules_child_type_check"
CHECK ("pricing_rules"."child_pricing_type" IN ('fixed', 'not_allowed'));
