import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ConsumptionCardProps {
  className?: string;
}

// Mock data for demonstration - in a real app, this would come from devices via MQTT
const generateMockConsumptionData = () => {
  const now = new Date();
  const hours = now.getHours();
  
  const hourlyData = [];
  for (let i = Math.max(0, hours - 5); i <= hours; i++) {
    hourlyData.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.random() * 2 + 1 // Random value between 1 and 3 kWh
    });
  }
  
  return {
    current: parseFloat((Math.random() * 1.5 + 1).toFixed(1)), // Random current consumption
    today: parseFloat((Math.random() * 10 + 10).toFixed(1)), // Random today's consumption
    yesterday: parseFloat((Math.random() * 10 + 12).toFixed(1)), // Random yesterday's consumption
    week: parseFloat((Math.random() * 50 + 70).toFixed(1)), // Random weekly consumption
    hourly: hourlyData
  };
};

export default function ConsumptionCard({ className }: ConsumptionCardProps) {
  const [consumption, setConsumption] = useState(generateMockConsumptionData());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const current = parseFloat((Math.random() * 1.5 + 1).toFixed(1));
      setConsumption(prev => ({
        ...prev,
        current
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Current Consumption</CardTitle>
        <Badge variant="outline" className="bg-blue-100 text-primary text-xs">Live</Badge>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800">{consumption.current}</div>
            <div className="text-gray-600">kWh</div>
          </div>
        </div>
        
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumption.hourly} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(1)}`} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} kWh`, "Consumption"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <div className="text-gray-500">Today</div>
            <div className="font-semibold text-gray-800">{consumption.today} kWh</div>
          </div>
          <div>
            <div className="text-gray-500">Yesterday</div>
            <div className="font-semibold text-gray-800">{consumption.yesterday} kWh</div>
          </div>
          <div>
            <div className="text-gray-500">This Week</div>
            <div className="font-semibold text-gray-800">{consumption.week} kWh</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
