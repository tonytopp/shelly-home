import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeather, parseWeatherData } from "@/hooks/useWeather";
import { WeatherIcon } from "@/lib/weatherIcons";
import { Droplets, Wind, CloudRain, ThermometerSun, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Weather() {
  const [coordinates, setCoordinates] = useState({
    longitude: "18.0686", // Stockholm
    latitude: "59.3293"
  });
  const [inputCoords, setInputCoords] = useState({
    longitude: coordinates.longitude,
    latitude: coordinates.latitude
  });

  const { data: weatherRawData, isLoading, error, refetch } = useWeather(coordinates);
  
  let weatherData;
  try {
    weatherData = weatherRawData ? parseWeatherData(weatherRawData) : null;
  } catch (e) {
    console.error("Error parsing weather data:", e);
  }
  
  const handleCoordinateChange = (e: React.FormEvent) => {
    e.preventDefault();
    setCoordinates(inputCoords);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
        <p className="text-gray-600">View current weather and forecast data from SMHI</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="text-lg">Location Settings</CardTitle>
            <Badge variant="outline" className="text-gray-500">
              {weatherData?.location || "Loading location..."}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCoordinateChange} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="longitude" className="block text-sm font-medium mb-1">Longitude</label>
              <Input
                id="longitude"
                value={inputCoords.longitude}
                onChange={(e) => setInputCoords({ ...inputCoords, longitude: e.target.value })}
                placeholder="e.g., 18.0686"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="latitude" className="block text-sm font-medium mb-1">Latitude</label>
              <Input
                id="latitude"
                value={inputCoords.latitude}
                onChange={(e) => setInputCoords({ ...inputCoords, latitude: e.target.value })}
                placeholder="e.g., 59.3293"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">Update Location</Button>
            </div>
          </form>
          
          <div className="mt-4 text-sm text-gray-500 flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
            <p>
              Enter coordinates for a location in Sweden. Data is provided by the Swedish Meteorological and Hydrological Institute (SMHI).
            </p>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error || !weatherData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500 mb-4">
              {error ? "Failed to load weather data" : "Error parsing weather data"}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Weather</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
                    <div className="text-5xl font-bold text-gray-800">
                      {Math.round(weatherData.currentTemperature)}°C
                    </div>
                    <div className="text-lg text-gray-600 capitalize mt-1">
                      {weatherData.weatherCondition.replace(/-/g, ' ')}
                    </div>
                  </div>
                  <div className="text-accent">
                    <WeatherIcon 
                      condition={weatherData.weatherCondition} 
                      className="text-accent" 
                      size={96}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-500">Humidity</div>
                    <div className="text-lg font-semibold">{Math.round(weatherData.humidity)}%</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Wind className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-500">Wind</div>
                    <div className="text-lg font-semibold">{Math.round(weatherData.wind)} m/s</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CloudRain className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-500">Precipitation</div>
                    <div className="text-lg font-semibold">{weatherData.precipitation}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 divide-x">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="text-center p-4">
                      <div className="text-gray-500 font-medium mb-2">{day.day}</div>
                      <div className="text-accent my-2">
                        <WeatherIcon 
                          condition={day.condition} 
                          className="text-accent mx-auto" 
                          size={36}
                        />
                      </div>
                      <div className="text-xl font-semibold text-gray-800">
                        {Math.round(day.temperature)}°
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Temperature Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {/* This would normally be a chart showing temperature forecast for coming days */}
                <div className="flex flex-col items-center justify-center h-full">
                  <ThermometerSun className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Detailed temperature forecast will be available in a future update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
