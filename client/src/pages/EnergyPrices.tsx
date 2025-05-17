import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useElectricityPrices, useCurrentPrice, usePriceStatistics, formatPriceData } from "@/hooks/useElectricityPrices";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, Legend, BarChart, Bar } from "recharts";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

export default function EnergyPrices() {
  const [zone, setZone] = useState("SE3");
  const [viewMode, setViewMode] = useState("chart");
  
  const { data: pricesData, isLoading, error } = useElectricityPrices({ zone });
  const currentPrice = useCurrentPrice(pricesData);
  const { lowestPrice, highestPrice, averagePrice, priceChange } = usePriceStatistics(pricesData);
  const { labels, data } = formatPriceData(pricesData);
  
  const chartData = labels.map((label, index) => ({
    time: label,
    price: data[index]
  }));
  
  const zones = [
    { value: "SE1", label: "Northern Sweden (SE1)" },
    { value: "SE2", label: "Northern Central Sweden (SE2)" },
    { value: "SE3", label: "Southern Central Sweden (SE3)" },
    { value: "SE4", label: "Southern Sweden (SE4)" },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Electricity Prices</h1>
        <p className="text-gray-600">View real-time electricity prices from the Nordic power market</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-5xl font-bold text-gray-800">
                {currentPrice ? currentPrice.SEK_per_kWh.toFixed(2) : "--"}
              </div>
              <div className="text-lg text-gray-600 mt-1">kr/kWh</div>
              
              {priceChange !== null && (
                <div className={`mt-4 px-4 py-2 rounded-full font-medium text-sm flex items-center ${
                  priceChange < 0 
                    ? "bg-green-100 text-green-700" 
                    : priceChange > 0 
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {priceChange < 0 ? (
                    <TrendingDown className="h-4 w-4 mr-2" />
                  ) : priceChange > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  ) : null}
                  <span>{priceChange.toFixed(2)} kr from previous hour</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Today's Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Lowest</div>
                <div className="text-2xl font-bold text-green-600">
                  {lowestPrice !== null ? lowestPrice.toFixed(2) : "--"} kr
                </div>
              </div>
              
              <div className="h-10 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500">Average</div>
                <div className="text-2xl font-bold text-blue-600">
                  {averagePrice !== null ? averagePrice.toFixed(2) : "--"} kr
                </div>
              </div>
              
              <div className="h-10 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500">Highest</div>
                <div className="text-2xl font-bold text-red-600">
                  {highestPrice !== null ? highestPrice.toFixed(2) : "--"} kr
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Price Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <Select
                value={zone}
                onValueChange={setZone}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a price zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 text-sm text-gray-500 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                <p>
                  Sweden is divided into four electricity price areas. Prices may vary between areas due to transmission capacity and regional production differences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Price Visualization</CardTitle>
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-96 text-red-500">
              Failed to load electricity prices
            </div>
          ) : (
            <div className="h-96">
              {viewMode === "chart" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value.toFixed(1)}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)} kr/kWh`, "Price"]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      name="SEK/kWh"
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value.toFixed(1)}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)} kr/kWh`, "Price"]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="price" 
                      name="SEK/kWh"
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
