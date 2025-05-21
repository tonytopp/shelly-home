import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { z } from "zod";

// Interface for SMHI weather data
interface SMHIForecast {
  approvedTime: string;
  referenceTime: string;
  timeSeries: Array<{
    validTime: string;
    parameters: Array<{
      name: string;
      values: number[];
      unit?: string;
    }>;
  }>;
}

// Interface for our simplified 5-day forecast
interface DayForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  precipitation: number;
  windSpeed: number;
  humidity: number;
  weatherSymbol: number;
  description: string;
}

/**
 * Process the SMHI forecast data to create a simplified 5-day forecast
 */
function processFiveDayForecast(data: SMHIForecast): { forecast: DayForecast[], rawData: SMHIForecast } {
  const forecast: DayForecast[] = [];
  const dayMap = new Map<string, {
    temps: number[];
    precip: number[];
    wind: number[];
    humidity: number[];
    symbols: number[];
  }>();
  
  // Process each time series entry
  for (const entry of data.timeSeries) {
    // Extract date (YYYY-MM-DD) from validTime
    const date = entry.validTime.split('T')[0];
    
    // Initialize day data if not exists
    if (!dayMap.has(date)) {
      dayMap.set(date, {
        temps: [],
        precip: [],
        wind: [],
        humidity: [],
        symbols: []
      });
    }
    
    const dayData = dayMap.get(date)!;
    
    // Extract parameters
    for (const param of entry.parameters) {
      if (param.name === 't') {
        // Temperature
        dayData.temps.push(param.values[0]);
      } else if (param.name === 'pmean') {
        // Precipitation
        dayData.precip.push(param.values[0]);
      } else if (param.name === 'ws') {
        // Wind speed
        dayData.wind.push(param.values[0]);
      } else if (param.name === 'r') {
        // Humidity
        dayData.humidity.push(param.values[0]);
      } else if (param.name === 'Wsymb2') {
        // Weather symbol
        dayData.symbols.push(param.values[0]);
      }
    }
  }
  
  // Calculate daily summaries
  dayMap.forEach((dayData, date) => {
    // Only include complete days with enough data points
    if (dayData.temps.length > 0) {
      const tempMin = Math.min(...dayData.temps);
      const tempMax = Math.max(...dayData.temps);
      const tempAvg = dayData.temps.reduce((sum: number, temp: number) => sum + temp, 0) / dayData.temps.length;
      
      // Sum precipitation for the day
      const totalPrecip = dayData.precip.reduce((sum: number, p: number) => sum + p, 0);
      
      // Average wind speed
      const avgWind = dayData.wind.length > 0 
        ? dayData.wind.reduce((sum: number, w: number) => sum + w, 0) / dayData.wind.length 
        : 0;
      
      // Average humidity
      const avgHumidity = dayData.humidity.length > 0 
        ? dayData.humidity.reduce((sum: number, h: number) => sum + h, 0) / dayData.humidity.length 
        : 0;
      
      // Most common weather symbol for the day
      const symbolCounts = new Map<number, number>();
      for (const symbol of dayData.symbols) {
        symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
      }
      
      let mostCommonSymbol = 1; // Default: clear sky
      let maxCount = 0;
      symbolCounts.forEach((count, symbol) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonSymbol = symbol;
        }
      });
      
      // Get weather description based on symbol
      const description = getWeatherDescription(mostCommonSymbol);
      
      forecast.push({
        date,
        temperature: {
          min: parseFloat(tempMin.toFixed(1)),
          max: parseFloat(tempMax.toFixed(1)),
          avg: parseFloat(tempAvg.toFixed(1))
        },
        precipitation: parseFloat(totalPrecip.toFixed(1)),
        windSpeed: parseFloat(avgWind.toFixed(1)),
        humidity: parseFloat(avgHumidity.toFixed(1)),
        weatherSymbol: mostCommonSymbol,
        description
      });
    }
  });
  
  // Sort by date and limit to 5 days
  const sortedForecast = [...forecast].sort((a: DayForecast, b: DayForecast) => a.date.localeCompare(b.date));
  const fiveDayForecast = sortedForecast.slice(0, 5);
  
  return { 
    forecast: fiveDayForecast,
    rawData: data 
  };
}

/**
 * Get a weather description based on SMHI weather symbol
 */
function getWeatherDescription(symbol: number): string {
  const descriptions: Record<number, string> = {
    1: "Clear sky",
    2: "Nearly clear sky",
    3: "Variable cloudiness",
    4: "Halfclear sky",
    5: "Cloudy sky",
    6: "Overcast",
    7: "Fog",
    8: "Light rain showers",
    9: "Moderate rain showers",
    10: "Heavy rain showers",
    11: "Thunderstorm",
    12: "Light sleet showers",
    13: "Moderate sleet showers",
    14: "Heavy sleet showers",
    15: "Light snow showers",
    16: "Moderate snow showers",
    17: "Heavy snow showers",
    18: "Light rain",
    19: "Moderate rain",
    20: "Heavy rain",
    21: "Thunder",
    22: "Light sleet",
    23: "Moderate sleet",
    24: "Heavy sleet",
    25: "Light snowfall",
    26: "Moderate snowfall",
    27: "Heavy snowfall"
  };
  
  return descriptions[symbol] || "Unknown weather";
}
import { insertShellyDeviceSchema, insertAutomationRuleSchema, deviceTypeSchema } from "@shared/schema";
import mqtt from "mqtt";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import testRoute from "./test-route";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Register the test route
  app.use(testRoute);
  
  // MQTT connection
  const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "mqtt://localhost:1883");
  
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to all Shelly device topics
    mqttClient.subscribe('shellies/#');
  });
  
  mqttClient.on('message', async (topic, message) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);
    
    // Update device status based on MQTT messages
    const devices = await storage.getAllDevices();
    const device = devices.find(d => d.mqttTopic === topic || topic.startsWith(d.mqttTopic));
    
    if (device) {
      try {
        const data = JSON.parse(message.toString());
        const updates: any = {
          lastSeen: new Date().toISOString(), // Convert Date to string for SQLite
          status: "online"
        };
        
        // Parse different message formats based on device type
        if (data.hasOwnProperty('relay_state')) {
          updates.isOn = data.relay_state === 1;
        } else if (data.hasOwnProperty('relay0')) {
          updates.isOn = data.relay0.ison;
        } else if (data.hasOwnProperty('ison')) {
          updates.isOn = data.ison;
        }
        
        if (data.hasOwnProperty('power')) {
          updates.power = data.power.toString();
        } else if (data.hasOwnProperty('power0')) {
          updates.power = data.power0.toString();
        }
        
        await storage.updateDevice(device.id, updates);
      } catch (error) {
        console.error(`Error processing MQTT message for device ${device.id}:`, error);
      }
    }
  });
  
  // Route to publish MQTT messages to control devices
  app.post('/api/devices/:id/control', async (req, res) => {
    const id = parseInt(req.params.id);
    const device = await storage.getDevice(id);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    const schema = z.object({
      action: z.enum(["turn_on", "turn_off"]),
    });
    
    try {
      const { action } = schema.parse(req.body);
      const topic = `${device.mqttTopic}/command`;
      const payload = action === "turn_on" ? "on" : "off";
      
      mqttClient.publish(topic, payload);
      
      // Update device state in our storage
      await storage.updateDevice(id, { 
        isOn: action === "turn_on",
        lastSeen: new Date().toISOString() // Convert Date to string for SQLite
      });
      
      return res.json({ 
        success: true, 
        message: `${action === "turn_on" ? "Turned on" : "Turned off"} device` 
      });
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // API endpoint to get electricity prices
  app.get('/api/electricity-prices', async (req, res) => {
    try {
      // Get current date in Swedish timezone (UTC+2)
      const now = new Date();
      
      // Format the date to YYYY/MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      // Allow overriding the date for testing
      const requestedDate = req.query.date;
      let dateString = `${month}-${day}`;
      
      if (requestedDate && typeof requestedDate === 'string') {
        dateString = requestedDate;
      }
      
      // Default to SE3 zone, which is central Sweden
      const zone = req.query.zone || "SE3";
      
      // Use the exact format: https://www.elprisetjustnu.se/api/v1/prices/2025/05-19_SE3.json
      const url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${dateString}_${zone}.json`;
      
      console.log(`Fetching electricity prices from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch electricity prices: ${response.statusText}`);
      }
      
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error('Error fetching electricity prices:', error);
      return res.status(500).json({ 
        message: "Failed to fetch electricity prices", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // API endpoint to get weather forecast from SMHI
  app.get('/api/weather', async (req, res) => {
    try {
      // Default coordinates for Vänersnas
      const longitude = req.query.longitude || "12.55";
      const latitude = req.query.latitude || "58.4";
      
      // Log the request
      console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
      
      const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the data to get a 5-day forecast
      const fiveDayForecast = processFiveDayForecast(data as SMHIForecast);
      
      return res.json(fiveDayForecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return res.status(500).json({ 
        message: "Failed to fetch weather data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Get all Shelly devices
  app.get('/api/devices', async (req, res) => {
    try {
      const devices = await storage.getAllDevices();
      return res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      return res.status(500).json({ message: "Failed to fetch devices" });
    }
  });
  
  // Get a single device by ID
  app.get('/api/devices/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      return res.json(device);
    } catch (error) {
      console.error('Error fetching device:', error);
      return res.status(500).json({ message: "Failed to fetch device" });
    }
  });
  
  // Create a new Shelly device
  app.post('/api/devices', async (req, res) => {
    try {
      const deviceData = insertShellyDeviceSchema.parse(req.body);
      
      // Validate device type
      const deviceTypeResult = deviceTypeSchema.safeParse(deviceData.type);
      if (!deviceTypeResult.success) {
        return res.status(400).json({ 
          message: "Invalid device type", 
          error: deviceTypeResult.error 
        });
      }
      
      const device = await storage.createDevice(deviceData);
      
      // Subscribe to the new device's MQTT topic
      mqttClient.subscribe(device.mqttTopic + '/#');
      
      return res.status(201).json(device);
    } catch (error) {
      console.error('Error creating device:', error);
      return res.status(400).json({ 
        message: "Failed to create device", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Update a device
  app.patch('/api/devices/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedDevice = await storage.updateDevice(id, updates);
      
      if (!updatedDevice) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      return res.json(updatedDevice);
    } catch (error) {
      console.error('Error updating device:', error);
      return res.status(400).json({ 
        message: "Failed to update device", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Delete a device
  app.delete('/api/devices/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const success = await storage.deleteDevice(id);
      
      if (success) {
        // Unsubscribe from the device's MQTT topic
        mqttClient.unsubscribe(device.mqttTopic + '/#');
        return res.json({ success: true });
      } else {
        return res.status(500).json({ message: "Failed to delete device" });
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      return res.status(500).json({ message: "Failed to delete device" });
    }
  });
  
  // Get all automation rules
  app.get('/api/automation-rules', async (req, res) => {
    try {
      const rules = await storage.getAllRules();
      return res.json(rules);
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      return res.status(500).json({ message: "Failed to fetch automation rules" });
    }
  });
  
  // Get a single automation rule by ID
  app.get('/api/automation-rules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.getRule(id);
      
      if (!rule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }
      
      return res.json(rule);
    } catch (error) {
      console.error('Error fetching automation rule:', error);
      return res.status(500).json({ message: "Failed to fetch automation rule" });
    }
  });
  
  // Create a new automation rule
  app.post('/api/automation-rules', async (req, res) => {
    try {
      const ruleData = insertAutomationRuleSchema.parse(req.body);
      const rule = await storage.createRule(ruleData);
      return res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return res.status(400).json({ 
        message: "Failed to create automation rule", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Update an automation rule
  app.patch('/api/automation-rules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedRule = await storage.updateRule(id, updates);
      
      if (!updatedRule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }
      
      return res.json(updatedRule);
    } catch (error) {
      console.error('Error updating automation rule:', error);
      return res.status(400).json({ 
        message: "Failed to update automation rule", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Delete an automation rule
  app.delete('/api/automation-rules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRule(id);
      
      if (success) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ message: "Automation rule not found" });
      }
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      return res.status(500).json({ message: "Failed to delete automation rule" });
    }
  });
  
  // Toggle automation rule status
  app.post('/api/automation-rules/:id/toggle', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.getRule(id);
      
      if (!rule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }
      
      const updatedRule = await storage.updateRule(id, { isActive: !rule.isActive });
      return res.json(updatedRule);
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      return res.status(500).json({ message: "Failed to toggle automation rule" });
    }
  });

  // Endpoint to download the entire application as a ZIP file
  app.get('/api/download', (req, res) => {
    try {
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level
      });
      
      // Set the headers
      res.attachment('shelly-smart-home.zip');
      
      // Pipe the archive to the response
      archive.pipe(res);
      
      // Add files to the archive
      const rootDir = path.resolve('.');
      
      // Add client directory
      archive.directory(path.join(rootDir, 'client'), 'client');
      
      // Add server directory
      archive.directory(path.join(rootDir, 'server'), 'server');
      
      // Add shared directory
      archive.directory(path.join(rootDir, 'shared'), 'shared');
      
      // Add configuration files
      ['package.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.ts', 'drizzle.config.ts', 'postcss.config.js', 'components.json'].forEach(file => {
        archive.file(path.join(rootDir, file), { name: file });
      });
      
      // Finalize the archive (this is when the actual writing happens)
      archive.finalize();
      
    } catch (error) {
      console.error('Error creating download archive:', error);
      return res.status(500).json({ 
        message: "Failed to create download package", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  return httpServer;
}
