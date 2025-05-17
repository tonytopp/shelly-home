import { Card } from "@/components/ui/card";
import ElectricityPriceCard from "@/components/cards/ElectricityPriceCard";
import WeatherCard from "@/components/cards/WeatherCard";
import ConsumptionCard from "@/components/cards/ConsumptionCard";
import ShellyDevicesCard from "@/components/cards/ShellyDevicesCard";
import AutomationCard from "@/components/cards/AutomationCard";

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your energy consumption and device status</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ElectricityPriceCard />
        <WeatherCard />
        <ConsumptionCard />
        <ShellyDevicesCard className="md:col-span-2" />
        <AutomationCard />
      </div>
    </div>
  );
}
