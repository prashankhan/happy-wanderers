CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"last_login_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_role_check" CHECK ("admin_users"."role" IN ('admin', 'staff'))
);
--> statement-breakpoint
CREATE TABLE "availability_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_available" boolean NOT NULL,
	"capacity_override" integer,
	"cutoff_override_hours" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "availability_overrides_tour_date_unique" UNIQUE("tour_id","date")
);
--> statement-breakpoint
CREATE TABLE "availability_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"weekday" integer NOT NULL,
	"default_capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "availability_rules_tour_weekday_unique" UNIQUE("tour_id","weekday"),
	CONSTRAINT "availability_rules_weekday_check" CHECK ("availability_rules"."weekday" >= 0 AND "availability_rules"."weekday" <= 6)
);
--> statement-breakpoint
CREATE TABLE "booking_activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"performed_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_reference" text NOT NULL,
	"tour_id" uuid NOT NULL,
	"departure_location_id" uuid NOT NULL,
	"tour_title_snapshot" text NOT NULL,
	"pickup_location_name_snapshot" text NOT NULL,
	"pickup_time_snapshot" varchar(16) NOT NULL,
	"booking_date" date NOT NULL,
	"booking_datetime" timestamp with time zone NOT NULL,
	"adults" integer DEFAULT 0 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"infants" integer DEFAULT 0 NOT NULL,
	"guest_total" integer NOT NULL,
	"price_per_adult_snapshot" numeric(12, 2) NOT NULL,
	"price_per_child_snapshot" numeric(12, 2) NOT NULL,
	"price_per_infant_snapshot" numeric(12, 2) NOT NULL,
	"total_price_snapshot" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"customer_first_name" text NOT NULL,
	"customer_last_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_phone_country_code" text,
	"customer_country" text,
	"customer_notes" text,
	"internal_notes" text,
	"status" text NOT NULL,
	"payment_status" text NOT NULL,
	"booking_source" text NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"expires_at" timestamp with time zone,
	"confirmation_email_sent_at" timestamp with time zone,
	"admin_alert_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference"),
	CONSTRAINT "bookings_status_check" CHECK ("bookings"."status" IN ('pending', 'confirmed', 'failed', 'expired', 'cancelled', 'refunded')),
	CONSTRAINT "bookings_payment_status_check" CHECK ("bookings"."payment_status" IN ('unpaid', 'paid', 'failed', 'refunded')),
	CONSTRAINT "bookings_adults_nonneg" CHECK ("bookings"."adults" >= 0),
	CONSTRAINT "bookings_children_nonneg" CHECK ("bookings"."children" >= 0),
	CONSTRAINT "bookings_infants_nonneg" CHECK ("bookings"."infants" >= 0),
	CONSTRAINT "bookings_guest_total_min" CHECK ("bookings"."guest_total" >= 1),
	CONSTRAINT "bookings_total_price_nonneg" CHECK ("bookings"."total_price_snapshot" >= 0),
	CONSTRAINT "bookings_source_check" CHECK ("bookings"."booking_source" IN ('website', 'admin_manual', 'phone_booking', 'offline', 'partner_agent'))
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"topic" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departure_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"name" text NOT NULL,
	"pickup_time" varchar(16) NOT NULL,
	"pickup_time_label" text,
	"price_adjustment_type" text NOT NULL,
	"price_adjustment_value" numeric(12, 4) DEFAULT '0' NOT NULL,
	"google_maps_link" text,
	"notes" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departure_locations_price_adj_check" CHECK ("departure_locations"."price_adjustment_type" IN ('none', 'fixed', 'percentage'))
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"label" text NOT NULL,
	"adult_price" numeric(12, 2) NOT NULL,
	"child_price" numeric(12, 2) NOT NULL,
	"infant_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"infant_pricing_type" text NOT NULL,
	"currency_code" text DEFAULT 'AUD' NOT NULL,
	"valid_from" date,
	"valid_until" date,
	"priority" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_rules_infant_type_check" CHECK ("pricing_rules"."infant_pricing_type" IN ('free', 'fixed', 'not_allowed'))
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id"),
	CONSTRAINT "stripe_webhook_events_status_check" CHECK ("stripe_webhook_events"."status" IN ('received', 'processed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "system_jobs_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"run_at" timestamp with time zone NOT NULL,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	CONSTRAINT "system_jobs_log_status_check" CHECK ("system_jobs_log"."status" IN ('success', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_reference_prefix" text DEFAULT 'HW' NOT NULL,
	"default_cutoff_hours" integer NOT NULL,
	"hold_expiry_minutes" integer DEFAULT 10 NOT NULL,
	"currency_code" text DEFAULT 'AUD' NOT NULL,
	"timezone" text DEFAULT 'Australia/Brisbane' NOT NULL,
	"business_name" text,
	"support_email" text,
	"support_phone" text,
	"admin_alert_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text NOT NULL,
	"alt_text" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"duration_text" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"group_size_text" text NOT NULL,
	"default_capacity" integer NOT NULL,
	"price_from_text" text,
	"location_region" text NOT NULL,
	"inclusions" jsonb,
	"exclusions" jsonb,
	"what_to_bring" jsonb,
	"pickup_notes" text,
	"cancellation_policy" text,
	"hero_badge" text,
	"booking_cutoff_hours" integer NOT NULL,
	"booking_enabled" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" text NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tours_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tours_status_check" CHECK ("tours"."status" IN ('draft', 'published', 'archived'))
);
--> statement-breakpoint
ALTER TABLE "availability_overrides" ADD CONSTRAINT "availability_overrides_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_activity_log" ADD CONSTRAINT "booking_activity_log_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_location_id_departure_locations_id_fk" FOREIGN KEY ("departure_location_id") REFERENCES "public"."departure_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departure_locations" ADD CONSTRAINT "departure_locations_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_images" ADD CONSTRAINT "tour_images_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_overrides_tour_date_idx" ON "availability_overrides" USING btree ("tour_id","date");--> statement-breakpoint
CREATE INDEX "availability_rules_tour_id_idx" ON "availability_rules" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "booking_activity_log_booking_id_idx" ON "booking_activity_log" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookings_tour_id_idx" ON "bookings" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "bookings_booking_date_idx" ON "bookings" USING btree ("booking_date");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_payment_status_idx" ON "bookings" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "bookings_customer_email_idx" ON "bookings" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "bookings_departure_location_id_idx" ON "bookings" USING btree ("departure_location_id");--> statement-breakpoint
CREATE INDEX "bookings_stripe_session_id_idx" ON "bookings" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "bookings_stripe_payment_intent_id_idx" ON "bookings" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "bookings_tour_date_idx" ON "bookings" USING btree ("tour_id","booking_date");--> statement-breakpoint
CREATE INDEX "departure_locations_tour_id_idx" ON "departure_locations" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "pricing_rules_tour_id_idx" ON "pricing_rules" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_images_tour_id_idx" ON "tour_images" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_images_one_hero_per_tour" ON "tour_images" USING btree ("tour_id") WHERE "tour_images"."is_hero" = true AND "tour_images"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "tours_slug_idx" ON "tours" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");