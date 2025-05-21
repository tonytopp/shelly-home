import { useQuery } from "@tanstack/react-query";
import { WeatherData, WeatherForecast, WeatherCondition } from "@/types";
import { mapSmhiWeatherCode } from "@/lib/weatherIcons";

// Format of day names
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

export function useWeather({ longitude = "18.0686", latitude = "59.3293" }: { longitude?: string, latitude?: string } = {}) {
  return useQuery({
    queryKey: ['/api/weather', longitude, latitude],
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
}

export function parseWeatherData(data: any): WeatherData {
  // Check if we're receiving the new 5-day forecast format
  if (data && data.forecast && Array.isArray(data.forecast)) {
    // Using the new 5-day forecast format
    const location = "Vänersnas, SE";
    
    // Get current day's data (first day in the forecast)
    const currentDay = data.forecast[0];
    
    if (!currentDay) {
      throw new Error("No forecast data available");
    }
    
    // Extract current weather information
    const currentTemperature = currentDay.temperature.avg;
    const weatherCondition = mapWeatherDescriptionToCondition(currentDay.description);
    const humidity = currentDay.humidity;
    const wind = currentDay.windSpeed;
    const precipitation = currentDay.precipitation > 0 ? 30 : 0; // Simplified percentage chance
    
    // Process the rest of the forecast days
    const forecast: WeatherForecast[] = [];
    
    // Skip the first day (current day) and process the next 4 days
    for (let i = 1; i < Math.min(5, data.forecast.length); i++) {
      const forecastDay = data.forecast[i];
      const forecastDate = new Date(forecastDay.date);
      
      forecast.push({
        day: dayFormatter.format(forecastDate),
        temperature: forecastDay.temperature.avg,
        condition: mapWeatherDescriptionToCondition(forecastDay.description)
      });
    }
    
    return {
      location,
      currentTemperature,
      weatherCondition,
      humidity,
      wind,
      precipitation,
      forecast
    };
  } else if (data && data.rawData && data.rawData.timeSeries) {
    // Fallback to the original SMHI format if needed
    return parseOriginalWeatherData(data.rawData);
  } else {
    throw new Error("Invalid weather data format");
  }
}

// Helper function to map our weather descriptions to the app's weather conditions
function mapWeatherDescriptionToCondition(description: string): WeatherCondition {
  // Map the SMHI weather descriptions to the limited set of conditions available in the app
  const descriptionMap: Record<string, WeatherCondition> = {
    "Clear sky": "clear-sky",
    "Nearly clear sky": "clear-sky",
    "Variable cloudiness": "few-clouds",
    "Halfclear sky": "few-clouds",
    "Cloudy sky": "scattered-clouds",
    "Overcast": "broken-clouds",
    "Fog": "mist",
    "Light rain showers": "shower-rain",
    "Moderate rain showers": "rain",
    "Heavy rain showers": "rain",
    "Thunderstorm": "thunderstorm",
    "Light sleet showers": "rain",
    "Moderate sleet showers": "rain",
    "Heavy sleet showers": "rain",
    "Light snow showers": "snow",
    "Moderate snow showers": "snow",
    "Heavy snow showers": "snow",
    "Light rain": "rain",
    "Moderate rain": "rain",
    "Heavy rain": "rain",
    "Thunder": "thunderstorm",
    "Light sleet": "rain",
    "Moderate sleet": "rain",
    "Heavy sleet": "rain",
    "Light snowfall": "snow",
    "Moderate snowfall": "snow",
    "Heavy snowfall": "snow"
  };
  
  return descriptionMap[description] || "scattered-clouds";
}

// Original parsing function for the raw SMHI data format
function parseOriginalWeatherData(data: any): WeatherData {
  if (!data || !data.timeSeries || data.timeSeries.length === 0) {
    throw new Error("Invalid weather data format");
  }
  
  // Get location name from coordinates
  const location = "Vänersnas, SE";
  
  // Parse current weather from first time series item
  const current = data.timeSeries[0];
  const currentParams = current.parameters;
  
  // Find the relevant parameters by name
  const tempParam = currentParams.find((p: any) => p.name === 't');
  const weatherStateParam = currentParams.find((p: any) => p.name === 'Wsymb2');
  const humidityParam = currentParams.find((p: any) => p.name === 'r');
  const windSpeedParam = currentParams.find((p: any) => p.name === 'ws');
  const precipParam = currentParams.find((p: any) => p.name === 'pcat');
  
  const currentTemperature = tempParam ? tempParam.values[0] : 0;
  const weatherCode = weatherStateParam ? weatherStateParam.values[0] : 1;
  const weatherCondition = mapSmhiWeatherCode(weatherCode);
  const humidity = humidityParam ? humidityParam.values[0] : 0;
  const wind = windSpeedParam ? windSpeedParam.values[0] : 0;
  const precipitation = precipParam ? (precipParam.values[0] > 0 ? 30 : 0) : 0; // Simplified
  
  // Process forecast for the next 4 days at noon
  const forecast: WeatherForecast[] = [];
  const today = new Date();
  
  // Get one forecast per day
  const processedDays = new Set<string>();
  
  for (const timeSeries of data.timeSeries) {
    const forecastDate = new Date(timeSeries.validTime);
    const day = forecastDate.toISOString().split('T')[0];
    
    // Skip today
    if (forecastDate.getDate() === today.getDate() && 
        forecastDate.getMonth() === today.getMonth() && 
        forecastDate.getFullYear() === today.getFullYear()) {
      continue;
    }
    
    // Skip already processed days
    if (processedDays.has(day)) {
      continue;
    }
    
    // Only get forecasts around noon
    const hour = forecastDate.getHours();
    if (hour < 11 || hour > 13) {
      continue;
    }
    
    processedDays.add(day);
    
    const params = timeSeries.parameters;
    const tempParam = params.find((p: any) => p.name === 't');
    const weatherStateParam = params.find((p: any) => p.name === 'Wsymb2');
    
    if (tempParam && weatherStateParam) {
      const temperature = tempParam.values[0];
      const weatherCode = weatherStateParam.values[0];
      const condition = mapSmhiWeatherCode(weatherCode);
      
      forecast.push({
        day: dayFormatter.format(forecastDate),
        temperature,
        condition
      });
    }
    
    // Stop after 4 days
    if (forecast.length >= 4) {
      break;
    }
  }
  
  return {
    location,
    currentTemperature,
    weatherCondition,
    humidity,
    wind,
    precipitation,
    forecast
  };
}
