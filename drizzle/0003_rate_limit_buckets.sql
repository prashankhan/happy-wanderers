CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "bucket_key" text PRIMARY KEY NOT NULL,
  "hit_count" integer NOT NULL,
  "window_end" timestamp with time zone NOT NULL
);
