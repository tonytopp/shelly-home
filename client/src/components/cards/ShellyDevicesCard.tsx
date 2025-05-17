import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Lightbulb, Heater, Tv, UtensilsCrossed } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useDevices, useControlDevice } from "@/hooks/useDevices";
import { ShellyDeviceState } from "@/types";
import AddDeviceModal from "../modals/AddDeviceModal";
import { useState } from "react";

interface ShellyDevicesCardProps {
  className?: string;
}

// Map device types to icons
const getDeviceIcon = (type: string) => {
  switch (type) {
    case "shelly1":
    case "shellydimmer":
      return <Lightbulb className="text-gray-600 mr-2 h-5 w-5" />;
    case "shellyplug":
      return <Heater className="text-gray-600 mr-2 h-5 w-5" />;
    case "shelly1pm":
      return <Tv className="text-gray-600 mr-2 h-5 w-5" />;
    case "shelly2":
      return <UtensilsCrossed className="text-gray-600 mr-2 h-5 w-5" />;
    default:
      return <Lightbulb className="text-gray-600 mr-2 h-5 w-5" />;
  }
};

export default function ShellyDevicesCard({ className }: ShellyDevicesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: devices, isLoading, error } = useDevices();
  const controlDevice = useControlDevice();
  
  const handleDeviceToggle = (device: ShellyDeviceState, isChecked: boolean) => {
    controlDevice.mutate({
      id: device.id,
      action: isChecked ? 'turn_on' : 'turn_off'
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Shelly Devices</CardTitle>
        <Button 
          variant="ghost" 
          className="text-primary text-sm font-medium p-0 h-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Device
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32 text-red-500">
            Failed to load devices
          </div>
        ) : devices && devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div 
                key={device.id} 
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center">
                    {getDeviceIcon(device.type)}
                    <h3 className="font-medium text-gray-800">{device.name}</h3>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      device.status === "online" ? "bg-green-500" : "bg-red-500"
                    } mr-2`}></span>
                    <span className="text-sm text-gray-500">{device.status}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-500">{device.power} kWh</span>
                  </div>
                </div>
                <Switch 
                  checked={device.isOn}
                  onCheckedChange={(checked) => handleDeviceToggle(device, checked)}
                  disabled={device.status === "offline" || controlDevice.isPending}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-4">No devices added yet</p>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
            >
              Add your first device
            </Button>
          </div>
        )}
      </CardContent>
      
      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Card>
  );
}
