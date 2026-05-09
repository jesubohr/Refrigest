ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment_inventory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "parts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_parts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tech_inventory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "warranties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "branches_tech_isolation" ON "branches" AS PERMISSIVE FOR ALL TO "authenticated" USING ("branches"."tech_id" = (select auth.uid())) WITH CHECK ("branches"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "claims_tech_isolation" ON "claims" AS PERMISSIVE FOR ALL TO "authenticated" USING ("claims"."tech_id" = (select auth.uid())) WITH CHECK ("claims"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "clients_tech_isolation" ON "clients" AS PERMISSIVE FOR ALL TO "authenticated" USING ("clients"."tech_id" = (select auth.uid())) WITH CHECK ("clients"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "equipment_tech_isolation" ON "equipment" AS PERMISSIVE FOR ALL TO "authenticated" USING ("equipment"."tech_id" = (select auth.uid())) WITH CHECK ("equipment"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "equipment_inventory_tech_isolation" ON "equipment_inventory" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM equipment WHERE equipment.id = "equipment_inventory"."equipment_id" AND equipment.tech_id = (select auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM equipment WHERE equipment.id = "equipment_inventory"."equipment_id" AND equipment.tech_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "parts_tech_isolation" ON "parts" AS PERMISSIVE FOR ALL TO "authenticated" USING ("parts"."tech_id" = (select auth.uid())) WITH CHECK ("parts"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "reminders_tech_isolation" ON "reminders" AS PERMISSIVE FOR ALL TO "authenticated" USING ("reminders"."tech_id" = (select auth.uid())) WITH CHECK ("reminders"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "reports_tech_isolation" ON "reports" AS PERMISSIVE FOR ALL TO "authenticated" USING ("reports"."tech_id" = (select auth.uid())) WITH CHECK ("reports"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "service_media_tech_isolation" ON "service_media" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM services WHERE services.id = "service_media"."service_id" AND services.tech_id = (select auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM services WHERE services.id = "service_media"."service_id" AND services.tech_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "service_parts_tech_isolation" ON "service_parts" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM services WHERE services.id = "service_parts"."service_id" AND services.tech_id = (select auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM services WHERE services.id = "service_parts"."service_id" AND services.tech_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "services_tech_isolation" ON "services" AS PERMISSIVE FOR ALL TO "authenticated" USING ("services"."tech_id" = (select auth.uid())) WITH CHECK ("services"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "tech_inventory_tech_isolation" ON "tech_inventory" AS PERMISSIVE FOR ALL TO "authenticated" USING ("tech_inventory"."tech_id" = (select auth.uid())) WITH CHECK ("tech_inventory"."tech_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "warranties_tech_isolation" ON "warranties" AS PERMISSIVE FOR ALL TO "authenticated" USING ("warranties"."tech_id" = (select auth.uid())) WITH CHECK ("warranties"."tech_id" = (select auth.uid()));