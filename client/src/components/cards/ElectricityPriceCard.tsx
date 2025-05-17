import { useState, useEffect } from "react";
import { Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useElectricityPrices, useCurrentPrice, usePriceStatistics, formatPriceData } from "@/hooks/useElectricityPrices";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ElectricityPriceCardProps {
  className?: string;
}

export default function ElectricityPriceCard({ className }: ElectricityPriceCardProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week">("day");
  const { data: pricesData, isLoading, error } = useElectricityPrices();
  
  const currentPrice = useCurrentPrice(pricesData);
  const { lowestPrice, highestPrice, averagePrice, priceChange } = usePriceStatistics(pricesData);
  const { labels, data } = formatPriceData(pricesData);
  
  const chartData = labels.map((label, index) => ({
    time: label,
    price: data[index]
  }));
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Electricity Prices</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as "day" | "week")}
        >
          <SelectTrigger className="w-[120px] text-sm bg-gray-100 border border-gray-300 rounded-md">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-48 text-red-500">
            Failed to load electricity prices
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-800">
                  {currentPrice ? currentPrice.SEK_per_kWh.toFixed(2) : "N/A"}
                </span>
                <span className="text-lg text-gray-600"> kr/kWh</span>
              </div>
              
              {priceChange !== null && (
                <div className={`px-3 py-1 rounded-full font-medium text-sm flex items-center ${
                  priceChange < 0 
                    ? "bg-green-100 text-secondary" 
                    : priceChange > 0 
                    ? "bg-red-100 text-danger"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {priceChange < 0 ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : priceChange > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : null}
                  <span>{priceChange.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kr/kWh`, "Price"]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Lowest Today</div>
                <div className="font-semibold text-gray-800">
                  {lowestPrice !== null ? `${lowestPrice.toFixed(2)} kr` : "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Highest Today</div>
                <div className="font-semibold text-gray-800">
                  {highestPrice !== null ? `${highestPrice.toFixed(2)} kr` : "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Average</div>
                <div className="font-semibold text-gray-800">
                  {averagePrice !== null ? `${averagePrice.toFixed(2)} kr` : "N/A"}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
