import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const shellyDevices = sqliteTable("shellyDevices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  ipAddress: text("ipAddress").notNull(),
  mqttTopic: text("mqttTopic").notNull(),
  status: text("status").default("offline"),
  power: text("power").default("0"),
  isOn: integer("isOn", { mode: 'boolean' }).default(false),
  lastSeen: text("lastSeen"),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

export const automationRules = sqliteTable("automationRules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  deviceId: integer("deviceId").notNull(),
  condition: text("condition", { mode: 'json' }).notNull(),
  action: text("action", { mode: 'json' }).notNull(),
  isActive: integer("isActive", { mode: 'boolean' }).default(true),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertShellyDeviceSchema = createInsertSchema(shellyDevices).pick({
  name: true,
  type: true,
  ipAddress: true,
  mqttTopic: true,
});

export const insertAutomationRuleSchema = createInsertSchema(automationRules).pick({
  name: true,
  description: true,
  deviceId: true,
  condition: true,
  action: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertShellyDevice = z.infer<typeof insertShellyDeviceSchema>;
export type ShellyDevice = typeof shellyDevices.$inferSelect;

export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;
export type AutomationRule = typeof automationRules.$inferSelect;

// Device type validation
export const deviceTypeSchema = z.enum([
  "shelly1",
  "shelly1pm",
  "shelly2",
  "shellydimmer",
  "shellyplug",
]);

export const deviceTypes = [
  { value: "shelly1", label: "Shelly 1" },
  { value: "shelly1pm", label: "Shelly 1PM" },
  { value: "shelly2", label: "Shelly 2" },
  { value: "shellydimmer", label: "Shelly Dimmer" },
  { value: "shellyplug", label: "Shelly Plug" },
];
