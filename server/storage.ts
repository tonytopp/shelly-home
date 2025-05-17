import { 
  users, 
  shellyDevices, 
  automationRules, 
  type User, 
  type InsertUser, 
  type ShellyDevice, 
  type InsertShellyDevice, 
  type AutomationRule, 
  type InsertAutomationRule 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Shelly Device operations
  getAllDevices(): Promise<ShellyDevice[]>;
  getDevice(id: number): Promise<ShellyDevice | undefined>;
  createDevice(device: InsertShellyDevice): Promise<ShellyDevice>;
  updateDevice(id: number, updates: Partial<ShellyDevice>): Promise<ShellyDevice | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  
  // Automation Rule operations
  getAllRules(): Promise<AutomationRule[]>;
  getRule(id: number): Promise<AutomationRule | undefined>;
  createRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  updateRule(id: number, updates: Partial<AutomationRule>): Promise<AutomationRule | undefined>;
  deleteRule(id: number): Promise<boolean>;
}

import { db } from "./db";
import { eq, count } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Shelly Device operations
  async getAllDevices(): Promise<ShellyDevice[]> {
    return db.select().from(shellyDevices);
  }

  async getDevice(id: number): Promise<ShellyDevice | undefined> {
    const [device] = await db.select().from(shellyDevices).where(eq(shellyDevices.id, id));
    return device;
  }

  async createDevice(insertDevice: InsertShellyDevice): Promise<ShellyDevice> {
    const now = new Date().toISOString();
    const [device] = await db
      .insert(shellyDevices)
      .values({
        name: insertDevice.name,
        type: insertDevice.type,
        ipAddress: insertDevice.ipAddress,
        mqttTopic: insertDevice.mqttTopic,
        status: "online",
        power: "0",
        isOn: false,
        lastSeen: now,
        createdAt: now
      })
      .returning();
    return device;
  }

  async updateDevice(id: number, updates: Partial<ShellyDevice>): Promise<ShellyDevice | undefined> {
    const [updatedDevice] = await db
      .update(shellyDevices)
      .set(updates)
      .where(eq(shellyDevices.id, id))
      .returning();
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    const result = await db
      .delete(shellyDevices)
      .where(eq(shellyDevices.id, id))
      .returning({ id: shellyDevices.id });
    return result.length > 0;
  }

  // Automation Rule operations
  async getAllRules(): Promise<AutomationRule[]> {
    return db.select().from(automationRules);
  }

  async getRule(id: number): Promise<AutomationRule | undefined> {
    const [rule] = await db.select().from(automationRules).where(eq(automationRules.id, id));
    return rule;
  }

  async createRule(insertRule: InsertAutomationRule): Promise<AutomationRule> {
    const now = new Date().toISOString();
    // Convert JSON objects to strings for SQLite
    const values = {
      ...insertRule,
      condition: JSON.stringify(insertRule.condition),
      action: JSON.stringify(insertRule.action),
      createdAt: now
    };
    
    const [rule] = await db
      .insert(automationRules)
      .values(values)
      .returning();
    return rule;
  }

  async updateRule(id: number, updates: Partial<AutomationRule>): Promise<AutomationRule | undefined> {
    const [updatedRule] = await db
      .update(automationRules)
      .set(updates)
      .where(eq(automationRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteRule(id: number): Promise<boolean> {
    const result = await db
      .delete(automationRules)
      .where(eq(automationRules.id, id))
      .returning({ id: automationRules.id });
    return result.length > 0;
  }

  // Seed data - only call this when you need to initialize the database
  async seedInitialData(): Promise<void> {
    const devicesCount = await db.select({ count: count() }).from(shellyDevices);
    
    if (devicesCount[0].count === 0) {
      // Add some initial devices
      await this.createDevice({
        name: "Living Room Light",
        type: "shelly1",
        ipAddress: "192.168.1.100",
        mqttTopic: "shellies/light/living_room"
      });
      
      await this.createDevice({
        name: "Bedroom Heater",
        type: "shellyplug",
        ipAddress: "192.168.1.101",
        mqttTopic: "shellies/plug/bedroom_heater"
      });
      
      await this.createDevice({
        name: "TV Outlet",
        type: "shelly1pm",
        ipAddress: "192.168.1.102",
        mqttTopic: "shellies/plug/tv_outlet"
      });
      
      await this.createDevice({
        name: "Kitchen Appliances",
        type: "shelly2",
        ipAddress: "192.168.1.103",
        mqttTopic: "shellies/plug/kitchen"
      });
    }

    const rulesCount = await db.select({ count: count() }).from(automationRules);
    
    if (rulesCount[0].count === 0) {
      // Add some initial automation rules
      await this.createRule({
        name: "Low Price Charging",
        description: "Turn on car charger when electricity price is below 1.0 kr/kWh",
        deviceId: 1,
        condition: {
          type: "price",
          operator: "lt",
          value: 1.0
        },
        action: {
          type: "turnOn",
          deviceId: 1
        },
        isActive: true
      });
      
      await this.createRule({
        name: "Smart Heating",
        description: "Reduce bedroom heater when price exceeds 2.0 kr/kWh",
        deviceId: 2,
        condition: {
          type: "price",
          operator: "gt",
          value: 2.0
        },
        action: {
          type: "turnOff",
          deviceId: 2
        },
        isActive: true
      });
    }
  }
}

export const storage = new DatabaseStorage();
