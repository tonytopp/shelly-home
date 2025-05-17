import { SunMedium, Cloudy, Drama, Cloud, Wheat, CloudRain, Group, Droplet, Eye } from "lucide-react";
import type { WeatherCondition } from "@/types";

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
  size?: number;
}

export function WeatherIcon({ condition, className, size = 24 }: WeatherIconProps) {
  const iconSize = { width: size, height: size };
  
  switch (condition) {
    case "clear-sky":
      return <SunMedium className={className} {...iconSize} />;
    case "few-clouds":
      return <Cloudy className={className} {...iconSize} />;
    case "scattered-clouds":
      return <Drama className={className} {...iconSize} />;
    case "broken-clouds":
      return <Cloud className={className} {...iconSize} />;
    case "shower-rain":
      return <Droplet className={className} {...iconSize} />;
    case "rain":
      return <Wheat className={className} {...iconSize} />;
    case "thunderstorm":
      return <CloudRain className={className} {...iconSize} />;
    case "snow":
      return <Group className={className} {...iconSize} />;
    case "mist":
      return <Eye className={className} {...iconSize} />;
    default:
      return <SunMedium className={className} {...iconSize} />;
  }
}

// Map SMHI weather codes to our weather conditions
export function mapSmhiWeatherCode(code: number): WeatherCondition {
  // SMHI Weatherstate codes:
  // 1: Clear sky
  // 2: Nearly clear sky
  // 3: Variable cloudiness
  // 4: Halfclear sky
  // 5: Cloudy sky
  // 6: Overcast
  // 7: Fog
  // 8: Light rain showers
  // 9: Moderate rain showers
  // 10: Heavy rain showers
  // 11: CloudRain
  // 12: Light sleet showers
  // 13: Moderate sleet showers
  // 14: Heavy sleet showers
  // 15: Light snow showers
  // 16: Moderate snow showers
  // 17: Heavy snow showers
  // 18: Light rain
  // 19: Moderate rain
  // 20: Heavy rain
  // 21: Thunder
  // 22: Light sleet
  // 23: Moderate sleet
  // 24: Heavy sleet
  // 25: Light snowfall
  // 26: Moderate snowfall
  // 27: Heavy snowfall
  
  switch (code) {
    case 1:
      return "clear-sky";
    case 2:
    case 3:
      return "few-clouds";
    case 4:
      return "scattered-clouds";
    case 5:
    case 6:
      return "broken-clouds";
    case 7:
      return "mist";
    case 8:
    case 9:
    case 10:
      return "shower-rain";
    case 11:
    case 21:
      return "thunderstorm";
    case 12:
    case 13:
    case 14:
    case 18:
    case 19:
    case 20:
    case 22:
    case 23:
    case 24:
      return "rain";
    case 15:
    case 16:
    case 17:
    case 25:
    case 26:
    case 27:
      return "snow";
    default:
      return "few-clouds";
  }
}
