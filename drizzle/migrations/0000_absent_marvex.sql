CREATE TABLE IF NOT EXISTS "appliances" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"purchase_date" timestamp with time zone NOT NULL,
	"warranty_duration" integer NOT NULL,
	"warranty_end_date" timestamp with time zone NOT NULL,
	"purchase_location" text,
	"notes" text,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintenance_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"appliance_id" text NOT NULL,
	"task_name" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"frequency" text,
	"service_provider" text,
	"contact_info" text,
	"notes" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"appliance_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_appliance_id_appliances_id_fk" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_contacts" ADD CONSTRAINT "service_contacts_appliance_id_appliances_id_fk" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
