// Electricity Price Data
export interface ElectricityPrice {
  SEK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}

// Weather Data
export type WeatherCondition = 
  | "clear-sky"
  | "few-clouds"
  | "scattered-clouds"
  | "broken-clouds"
  | "shower-rain"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "mist";

export interface WeatherData {
  location: string;
  currentTemperature: number;
  weatherCondition: WeatherCondition;
  humidity: number;
  wind: number;
  precipitation: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  day: string;
  temperature: number;
  condition: WeatherCondition;
}

// Device types
export interface ShellyDeviceState {
  id: number;
  name: string;
  type: string;
  ipAddress: string;
  mqttTopic: string;
  status: "online" | "offline";
  power: string;
  isOn: boolean;
  lastSeen?: string;
}

// Automation types 
export type ConditionType = "price" | "time" | "weather";
export type ActionType = "turnOn" | "turnOff";
export type ComparisonOperator = "lt" | "gt" | "eq";

export interface PriceCondition {
  type: "price";
  operator: ComparisonOperator;
  value: number;
}

export interface TimeCondition {
  type: "time";
  startTime: string;
  endTime: string;
}

export interface WeatherConditionRule {
  type: "weather";
  condition: WeatherCondition;
}

export type Condition = PriceCondition | TimeCondition | WeatherConditionRule;

export interface Action {
  type: ActionType;
  deviceId: number;
}

export interface AutomationRuleState {
  id: number;
  name: string;
  description: string;
  deviceId: number;
  condition: Condition;
  action: Action;
  isActive: boolean;
}

// Consumption data
export interface ConsumptionData {
  current: number;
  today: number;
  yesterday: number;
  week: number;
  hourly: {
    time: string;
    value: number;
  }[];
}
