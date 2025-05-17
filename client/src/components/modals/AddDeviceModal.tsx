import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddDevice } from "@/hooks/useDevices";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deviceTypes } from "@shared/schema";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [mqttTopic, setMqttTopic] = useState("");
  
  const addDevice = useAddDevice();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !ipAddress) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a default MQTT topic if not provided
    const topicToUse = mqttTopic || `shellies/${type}/${name.toLowerCase().replace(/\s+/g, '_')}`;
    
    addDevice.mutate(
      {
        name,
        type,
        ipAddress,
        mqttTopic: topicToUse
      },
      {
        onSuccess: () => {
          toast({
            title: "Device Added",
            description: `${name} has been added successfully`,
            variant: "default"
          });
          resetForm();
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Failed to add device",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };
  
  const resetForm = () => {
    setName("");
    setType("");
    setIpAddress("");
    setMqttTopic("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Add New Shelly Device</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Living Room Light"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={type}
                onValueChange={setType}
              >
                <SelectTrigger id="deviceType">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((deviceType) => (
                    <SelectItem key={deviceType.value} value={deviceType.value}>
                      {deviceType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="deviceIp">IP Address</Label>
              <Input
                id="deviceIp"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g., 192.168.1.100"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="mqttTopic">MQTT Topic (optional)</Label>
              <Input
                id="mqttTopic"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                placeholder="e.g., shellies/light/living_room"
              />
              <p className="text-xs text-gray-500">
                Leave empty to generate automatically
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={addDevice.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={addDevice.isPending}
            >
              {addDevice.isPending ? "Adding..." : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
