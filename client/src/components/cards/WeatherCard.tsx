import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeather, parseWeatherData } from "@/hooks/useWeather";
import { WeatherIcon } from "@/lib/weatherIcons";

interface WeatherCardProps {
  className?: string;
}

export default function WeatherCard({ className }: WeatherCardProps) {
  const { data: weatherRawData, isLoading, error } = useWeather();
  
  let weatherData;
  try {
    weatherData = weatherRawData ? parseWeatherData(weatherRawData) : null;
  } catch (e) {
    console.error("Error parsing weather data:", e);
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Weather Forecast</CardTitle>
        <span className="text-sm text-gray-500">
          {weatherData?.location || "Loading location..."}
        </span>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error || !weatherData ? (
          <div className="flex justify-center items-center h-48 text-red-500">
            {error ? "Failed to load weather data" : "Error parsing weather data"}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.round(weatherData.currentTemperature)}°C
                </div>
                <div className="text-gray-600 capitalize">
                  {weatherData.weatherCondition.replace(/-/g, ' ')}
                </div>
              </div>
              <div className="text-accent text-5xl">
                <WeatherIcon 
                  condition={weatherData.weatherCondition} 
                  className="text-accent" 
                  size={64}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="text-center p-2">
                  <div className="text-sm text-gray-500">{day.day}</div>
                  <div className="text-accent my-1">
                    <WeatherIcon 
                      condition={day.condition} 
                      className="text-accent mx-auto" 
                      size={24}
                    />
                  </div>
                  <div className="text-gray-800 font-medium">
                    {Math.round(day.temperature)}°
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <div className="text-gray-500">Humidity</div>
                <div className="font-semibold">{Math.round(weatherData.humidity)}%</div>
              </div>
              <div>
                <div className="text-gray-500">Wind</div>
                <div className="font-semibold">{Math.round(weatherData.wind)} m/s</div>
              </div>
              <div>
                <div className="text-gray-500">Precipitation</div>
                <div className="font-semibold">{weatherData.precipitation}%</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
