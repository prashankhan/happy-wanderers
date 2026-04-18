ALTER TABLE "pricing_rules" ADD COLUMN IF NOT EXISTS "max_guests_scope" text NOT NULL DEFAULT 'entire_party';

ALTER TABLE "pricing_rules" DROP CONSTRAINT IF EXISTS "pricing_rules_max_guests_scope_check";

ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_max_guests_scope_check" CHECK ("max_guests_scope" IN ('entire_party', 'adults_and_children_only', 'adults_only'));
