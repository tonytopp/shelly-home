import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useDevices, useDeleteDevice, useControlDevice } from "@/hooks/useDevices";
import AddDeviceModal from "@/components/modals/AddDeviceModal";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Heater, Tv, UtensilsCrossed } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ShellyDeviceState } from "@/types";

export default function Devices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<ShellyDeviceState | null>(null);
  const { data: devices, isLoading, error } = useDevices();
  const deleteDevice = useDeleteDevice();
  const controlDevice = useControlDevice();
  const { toast } = useToast();
  
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
  
  const handleDeviceToggle = (device: ShellyDeviceState, isChecked: boolean) => {
    controlDevice.mutate({
      id: device.id,
      action: isChecked ? 'turn_on' : 'turn_off'
    }, {
      onSuccess: () => {
        toast({
          title: `Device ${isChecked ? 'turned on' : 'turned off'}`,
          description: `${device.name} has been ${isChecked ? 'turned on' : 'turned off'} successfully`,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to control device",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleDeleteConfirm = () => {
    if (deviceToDelete) {
      deleteDevice.mutate(deviceToDelete.id, {
        onSuccess: () => {
          toast({
            title: "Device deleted",
            description: `${deviceToDelete.name} has been deleted successfully`,
          });
          setDeviceToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to delete device",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
          });
        }
      });
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
          <p className="text-gray-600">Manage your Shelly smart devices</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500 mb-4">Failed to load devices</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      ) : devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {getDeviceIcon(device.type)}
                    <CardTitle>{device.name}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-red-500 p-2 h-8 w-8"
                    onClick={() => setDeviceToDelete(device)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        device.status === "online" ? "bg-green-500" : "bg-red-500"
                      } mr-2`}></span>
                      <span>{device.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Power</span>
                    <span>{device.power} kWh</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">IP Address</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {device.ipAddress}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">MQTT Topic</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[160px]" title={device.mqttTopic}>
                      {device.mqttTopic}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Power</span>
                    <Switch 
                      checked={device.isOn}
                      onCheckedChange={(checked) => handleDeviceToggle(device, checked)}
                      disabled={device.status === "offline" || controlDevice.isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-500 mb-4">No devices added yet</p>
            <Button onClick={() => setIsModalOpen(true)}>
              Add your first device
            </Button>
          </CardContent>
        </Card>
      )}
      
      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <AlertDialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device "{deviceToDelete?.name}" from your system. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
