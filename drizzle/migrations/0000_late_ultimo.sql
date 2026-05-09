CREATE TYPE "public"."media_kind" AS ENUM('photo_before', 'photo_after', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."reminder_kind" AS ENUM('preventive_6mo', 'warranty_expiry');--> statement-breakpoint
CREATE TYPE "public"."report_kind" AS ENUM('asistencia', 'garantia');--> statement-breakpoint
CREATE TYPE "public"."warranty_coverage" AS ENUM('labor', 'full');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_wa" text NOT NULL,
	"tech_id" uuid NOT NULL,
	"name" text NOT NULL,
	"lat" real,
	"lng" real,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warranty_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"whatsapp_e164" text PRIMARY KEY NOT NULL,
	"tech_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"legal_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"brand" text NOT NULL,
	"model" text,
	"refrigerant" text,
	"placa_photo_url" text,
	"placa_photo_pending" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_inventory" (
	"equipment_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"qty" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "equipment_inventory_equipment_id_part_id_pk" PRIMARY KEY("equipment_id","part_id")
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tech_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"kind" "reminder_kind" NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"kind" "report_kind" NOT NULL,
	"pdf_url" text,
	"pdf_pending" boolean DEFAULT true NOT NULL,
	"unique_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"kind" "media_kind" NOT NULL,
	"url" text,
	"thumb_url" text,
	"pending_upload" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_parts" (
	"service_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"qty" integer NOT NULL,
	CONSTRAINT "service_parts_service_id_part_id_pk" PRIMARY KEY("service_id","part_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"checklist_jsonb" jsonb,
	"notes_text" text,
	"voice_transcript" text,
	"voice_pending" boolean DEFAULT false NOT NULL,
	"finalized" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tech_inventory" (
	"tech_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"qty" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tech_inventory_tech_id_part_id_pk" PRIMARY KEY("tech_id","part_id")
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"duration_days" integer NOT NULL,
	"coverage" "warranty_coverage" NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_client_wa_clients_whatsapp_e164_fk" FOREIGN KEY ("client_wa") REFERENCES "public"."clients"("whatsapp_e164") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_warranty_id_warranties_id_fk" FOREIGN KEY ("warranty_id") REFERENCES "public"."warranties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inventory" ADD CONSTRAINT "equipment_inventory_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inventory" ADD CONSTRAINT "equipment_inventory_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_media" ADD CONSTRAINT "service_media_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_inventory" ADD CONSTRAINT "tech_inventory_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_client_wa_idx" ON "branches" USING btree ("client_wa");--> statement-breakpoint
CREATE INDEX "equipment_branch_id_idx" ON "equipment" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "reminders_due_at_idx" ON "reminders" USING btree ("due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_unique_number_idx" ON "reports" USING btree ("unique_number");--> statement-breakpoint
CREATE INDEX "service_media_service_id_idx" ON "service_media" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "services_equipment_id_idx" ON "services" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "warranties_expires_at_idx" ON "warranties" USING btree ("expires_at");