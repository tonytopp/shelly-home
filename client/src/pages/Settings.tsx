import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMqtt } from "@/hooks/useMqtt";
import { Settings as SettingsIcon, Save, RefreshCw, Zap, Server, CloudSun } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings
  const [theme, setTheme] = useState("light");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("60");
  
  // MQTT settings
  const [mqttBrokerUrl, setMqttBrokerUrl] = useState("mqtt://localhost:1883");
  const [mqttUsername, setMqttUsername] = useState("");
  const [mqttPassword, setMqttPassword] = useState("");
  const [mqttClientId, setMqttClientId] = useState(`shelly-energy-${Math.floor(Math.random() * 1000)}`);
  
  // API settings
  const [electricityPriceZone, setElectricityPriceZone] = useState("SE3");
  const [weatherLongitude, setWeatherLongitude] = useState("18.0686");
  const [weatherLatitude, setWeatherLatitude] = useState("59.3293");
  
  const { toast } = useToast();
  const { isConnected, error, connect } = useMqtt(mqttBrokerUrl);
  
  const handleSaveGeneral = () => {
    // In a real app, this would save to persistent storage or a backend API
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully",
    });
  };
  
  const handleSaveMqtt = () => {
    // In a real app, this would save to persistent storage or a backend API
    toast({
      title: "MQTT Settings Saved",
      description: "MQTT connection settings have been updated successfully",
    });
  };
  
  const handleTestMqttConnection = () => {
    connect();
    
    if (isConnected) {
      toast({
        title: "MQTT Connection Successful",
        description: "Successfully connected to MQTT broker",
      });
    } else if (error) {
      toast({
        title: "MQTT Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleSaveApi = () => {
    // In a real app, this would save to persistent storage or a backend API
    toast({
      title: "API Settings Saved",
      description: "API settings have been updated successfully",
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Configure your ShellyEnergy application preferences</p>
      </div>
      
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-semibold">Application Settings</CardTitle>
              <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="mqtt">MQTT</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <TabsContent value="general" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">General Settings</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={theme}
                      onValueChange={setTheme}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoRefresh">Auto-refresh data</Label>
                      <Switch
                        id="autoRefresh"
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Automatically refresh data from APIs and MQTT devices
                    </p>
                  </div>
                  
                  {autoRefresh && (
                    <div className="grid gap-2">
                      <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                      <Select
                        value={refreshInterval}
                        onValueChange={setRefreshInterval}
                      >
                        <SelectTrigger id="refreshInterval">
                          <SelectValue placeholder="Select refresh interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                          <SelectItem value="600">10 minutes</SelectItem>
                          <SelectItem value="1800">30 minutes</SelectItem>
                          <SelectItem value="3600">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveGeneral}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mqtt" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">MQTT Connection</h3>
                </div>
                
                <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    Configure your MQTT broker connection settings. This is required for controlling your Shelly devices and receiving real-time updates.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Broker Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="mqttServer">MQTT Server</Label>
                          <Input
                            id="mqttServer"
                            value={mqttBrokerUrl.split('://')[1]?.split(':')[0] || ''}
                            onChange={(e) => {
                              const protocol = mqttBrokerUrl.startsWith('mqtts') ? 'mqtts://' : 'mqtt://';
                              const port = mqttBrokerUrl.split(':')[2] || '1883';
                              setMqttBrokerUrl(`${protocol}${e.target.value}:${port}`);
                            }}
                            placeholder="e.g., broker.example.com"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="mqttPort">Port</Label>
                          <Input
                            id="mqttPort"
                            value={mqttBrokerUrl.split(':')[2] || '1883'}
                            onChange={(e) => {
                              const protocol = mqttBrokerUrl.startsWith('mqtts') ? 'mqtts://' : 'mqtt://';
                              const server = mqttBrokerUrl.split('://')[1]?.split(':')[0] || 'localhost';
                              setMqttBrokerUrl(`${protocol}${server}:${e.target.value}`);
                            }}
                            placeholder="e.g., 1883"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="useSecureConnection"
                            checked={mqttBrokerUrl.startsWith('mqtts')}
                            onCheckedChange={(checked) => {
                              const protocol = checked ? 'mqtts://' : 'mqtt://';
                              const server = mqttBrokerUrl.split('://')[1] || 'localhost:1883';
                              setMqttBrokerUrl(`${protocol}${server}`);
                            }}
                          />
                          <Label htmlFor="useSecureConnection" className="text-sm">Use secure connection (TLS/SSL)</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="mqttUsername">Username</Label>
                          <Input
                            id="mqttUsername"
                            value={mqttUsername}
                            onChange={(e) => setMqttUsername(e.target.value)}
                            placeholder="MQTT username"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="mqttPassword">Password</Label>
                          <Input
                            id="mqttPassword"
                            type="password"
                            value={mqttPassword}
                            onChange={(e) => setMqttPassword(e.target.value)}
                            placeholder="MQTT password"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2 mt-4">
                        <Label htmlFor="mqttClientId">Client ID</Label>
                        <Input
                          id="mqttClientId"
                          value={mqttClientId}
                          onChange={(e) => setMqttClientId(e.target.value)}
                          placeholder="Client ID for MQTT connection"
                        />
                        <p className="text-xs text-gray-500">
                          A unique identifier for this client. Leave as is if unsure.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        } mr-3`}></span>
                        <span className="font-medium">
                          {isConnected ? "Connected" : "Disconnected"}
                        </span>
                        {error && (
                          <span className="ml-2 text-red-600 text-sm">
                            Error: {error.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        <p>Connection String: {mqttBrokerUrl}</p>
                        <p>Username: {mqttUsername || 'None'}</p>
                        <p>Client ID: {mqttClientId}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <Button variant="outline" onClick={handleTestMqttConnection}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </Button>
                  <Button onClick={handleSaveMqtt}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Electricity Price API</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="electricityPriceZone">Price Zone</Label>
                    <Select
                      value={electricityPriceZone}
                      onValueChange={setElectricityPriceZone}
                    >
                      <SelectTrigger id="electricityPriceZone">
                        <SelectValue placeholder="Select price zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SE1">Northern Sweden (SE1)</SelectItem>
                        <SelectItem value="SE2">Northern Central Sweden (SE2)</SelectItem>
                        <SelectItem value="SE3">Southern Central Sweden (SE3)</SelectItem>
                        <SelectItem value="SE4">Southern Sweden (SE4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-6 mb-4">
                  <CloudSun className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Weather API</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="weatherLongitude">Longitude</Label>
                      <Input
                        id="weatherLongitude"
                        value={weatherLongitude}
                        onChange={(e) => setWeatherLongitude(e.target.value)}
                        placeholder="e.g., 18.0686"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="weatherLatitude">Latitude</Label>
                      <Input
                        id="weatherLatitude"
                        value={weatherLatitude}
                        onChange={(e) => setWeatherLatitude(e.target.value)}
                        placeholder="e.g., 59.3293"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Enter coordinates for the location you want to receive weather data for.
                    Default is set to Stockholm, Sweden.
                  </p>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveApi}>
                    <Save className="mr-2 h-4 w-4" />
                    Save API Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
