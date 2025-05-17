import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, GanttChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDevices } from "@/hooks/useDevices";
import { useAutomations, useAddAutomation, useUpdateAutomation, useDeleteAutomation, useToggleAutomation } from "@/hooks/useAutomations";
import { AutomationRuleState, Condition, Action, PriceCondition, TimeCondition, WeatherConditionRule } from "@/types";

export default function Automation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRuleState | null>(null);
  const [editingRule, setEditingRule] = useState<AutomationRuleState | null>(null);
  
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [conditionType, setConditionType] = useState<"price" | "time" | "weather">("price");
  const [priceOperator, setPriceOperator] = useState<"lt" | "gt" | "eq">("lt");
  const [priceValue, setPriceValue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [weatherCondition, setWeatherCondition] = useState<string>("clear-sky");
  const [actionType, setActionType] = useState<"turnOn" | "turnOff">("turnOn");
  
  const { data: devices, isLoading: isLoadingDevices } = useDevices();
  const { data: automations, isLoading: isLoadingAutomations } = useAutomations();
  const addAutomation = useAddAutomation();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();
  const toggleAutomation = useToggleAutomation();
  const { toast } = useToast();
  
  const weatherConditions = [
    { value: "clear-sky", label: "Clear Sky" },
    { value: "few-clouds", label: "Few Clouds" },
    { value: "scattered-clouds", label: "Scattered Clouds" },
    { value: "broken-clouds", label: "Broken Clouds" },
    { value: "shower-rain", label: "Shower Rain" },
    { value: "rain", label: "Rain" },
    { value: "thunderstorm", label: "Thunderstorm" },
    { value: "snow", label: "Snow" },
    { value: "mist", label: "Mist" }
  ];
  
  const handleOpenModal = (rule?: AutomationRuleState) => {
    if (rule) {
      setIsEditMode(true);
      setEditingRule(rule);
      setRuleName(rule.name);
      setRuleDescription(rule.description);
      setDeviceId(rule.deviceId.toString());
      
      // Set condition fields based on rule type
      if (rule.condition.type === "price") {
        const priceCondition = rule.condition as PriceCondition;
        setConditionType("price");
        setPriceOperator(priceCondition.operator);
        setPriceValue(priceCondition.value.toString());
      } else if (rule.condition.type === "time") {
        const timeCondition = rule.condition as TimeCondition;
        setConditionType("time");
        setStartTime(timeCondition.startTime);
        setEndTime(timeCondition.endTime);
      } else if (rule.condition.type === "weather") {
        const weatherCondition = rule.condition as WeatherConditionRule;
        setConditionType("weather");
        setWeatherCondition(weatherCondition.condition);
      }
      
      setActionType(rule.action.type);
    } else {
      setIsEditMode(false);
      setEditingRule(null);
      resetForm();
    }
    setIsModalOpen(true);
  };
  
  const resetForm = () => {
    setRuleName("");
    setRuleDescription("");
    setDeviceId("");
    setConditionType("price");
    setPriceOperator("lt");
    setPriceValue("");
    setStartTime("");
    setEndTime("");
    setWeatherCondition("clear-sky");
    setActionType("turnOn");
  };
  
  const buildCondition = (): Condition => {
    if (conditionType === "price") {
      return {
        type: "price",
        operator: priceOperator,
        value: parseFloat(priceValue)
      };
    } else if (conditionType === "time") {
      return {
        type: "time",
        startTime,
        endTime
      };
    } else {
      return {
        type: "weather",
        condition: weatherCondition as any
      };
    }
  };
  
  const buildAction = (): Action => {
    return {
      type: actionType,
      deviceId: parseInt(deviceId)
    };
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ruleName || !ruleDescription || !deviceId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (conditionType === "price" && !priceValue) {
      toast({
        title: "Validation Error",
        description: "Please enter a price value",
        variant: "destructive"
      });
      return;
    }
    
    if (conditionType === "time" && (!startTime || !endTime)) {
      toast({
        title: "Validation Error",
        description: "Please enter start and end times",
        variant: "destructive"
      });
      return;
    }
    
    const condition = buildCondition();
    const action = buildAction();
    
    if (isEditMode && editingRule) {
      updateAutomation.mutate(
        {
          id: editingRule.id,
          name: ruleName,
          description: ruleDescription,
          deviceId: parseInt(deviceId),
          condition,
          action,
        },
        {
          onSuccess: () => {
            toast({
              title: "Rule Updated",
              description: `${ruleName} has been updated successfully`,
              variant: "default"
            });
            resetForm();
            setIsModalOpen(false);
          },
          onError: (error) => {
            toast({
              title: "Failed to update rule",
              description: error instanceof Error ? error.message : "Unknown error occurred",
              variant: "destructive"
            });
          }
        }
      );
    } else {
      addAutomation.mutate(
        {
          name: ruleName,
          description: ruleDescription,
          deviceId: parseInt(deviceId),
          condition,
          action,
          isActive: true
        },
        {
          onSuccess: () => {
            toast({
              title: "Rule Added",
              description: `${ruleName} has been added successfully`,
              variant: "default"
            });
            resetForm();
            setIsModalOpen(false);
          },
          onError: (error) => {
            toast({
              title: "Failed to add rule",
              description: error instanceof Error ? error.message : "Unknown error occurred",
              variant: "destructive"
            });
          }
        }
      );
    }
  };
  
  const handleToggleRule = (rule: AutomationRuleState) => {
    toggleAutomation.mutate(rule.id, {
      onSuccess: () => {
        toast({
          title: rule.isActive ? "Rule Disabled" : "Rule Enabled",
          description: `${rule.name} has been ${rule.isActive ? "disabled" : "enabled"} successfully`,
          variant: "default"
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to toggle rule",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleDeleteRule = () => {
    if (ruleToDelete) {
      deleteAutomation.mutate(ruleToDelete.id, {
        onSuccess: () => {
          toast({
            title: "Rule Deleted",
            description: `${ruleToDelete.name} has been deleted successfully`,
            variant: "default"
          });
          setRuleToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to delete rule",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
          });
        }
      });
    }
  };
  
  const getConditionDescription = (condition: Condition): string => {
    if (condition.type === "price") {
      const priceCondition = condition as PriceCondition;
      const operator = priceCondition.operator === "lt" 
        ? "less than" 
        : priceCondition.operator === "gt" 
        ? "greater than" 
        : "equal to";
      return `When electricity price is ${operator} ${priceCondition.value} kr/kWh`;
    } else if (condition.type === "time") {
      const timeCondition = condition as TimeCondition;
      return `Between ${timeCondition.startTime} and ${timeCondition.endTime}`;
    } else {
      const weatherCondition = condition as WeatherConditionRule;
      return `When weather condition is ${weatherCondition.condition.replace(/-/g, ' ')}`;
    }
  };
  
  const getActionDescription = (action: Action, devices?: any[]): string => {
    const deviceName = devices?.find(d => d.id === action.deviceId)?.name || `Device #${action.deviceId}`;
    return `${action.type === "turnOn" ? "Turn on" : "Turn off"} ${deviceName}`;
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Automation Rules</h1>
          <p className="text-gray-600">Create and manage automation rules for your Shelly devices</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0"
          onClick={() => handleOpenModal()}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
      
      {isLoadingAutomations || isLoadingDevices ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : automations && automations.length > 0 ? (
        <div className="space-y-4">
          {automations.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <GanttChart className="text-primary mr-2 h-5 w-5" />
                    <CardTitle>{rule.name}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-blue-500 p-2 h-8 w-8"
                      onClick={() => handleOpenModal(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-red-500 p-2 h-8 w-8"
                      onClick={() => setRuleToDelete(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Condition</h3>
                      <p className="text-gray-800">{getConditionDescription(rule.condition)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Action</h3>
                      <p className="text-gray-800">{getActionDescription(rule.action, devices)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center">
                      <span className="mr-2">{rule.isActive ? "Active" : "Inactive"}</span>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule)}
                        disabled={toggleAutomation.isPending}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-500 mb-4">No automation rules added yet</p>
            <Button onClick={() => handleOpenModal()}>
              Create your first rule
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Rule Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {isEditMode ? "Edit Automation Rule" : "Add Automation Rule"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., Low Price Charging"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ruleDescription">Description</Label>
                <Input
                  id="ruleDescription"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="e.g., Turn on device when electricity price is low"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="deviceId">Device</Label>
                <Select
                  value={deviceId}
                  onValueChange={setDeviceId}
                >
                  <SelectTrigger id="deviceId">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices?.map((device) => (
                      <SelectItem key={device.id} value={device.id.toString()}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="conditionType">Condition Type</Label>
                <Select
                  value={conditionType}
                  onValueChange={(value) => setConditionType(value as any)}
                >
                  <SelectTrigger id="conditionType">
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Electricity Price</SelectItem>
                    <SelectItem value="time">Time of Day</SelectItem>
                    <SelectItem value="weather">Weather Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {conditionType === "price" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="priceOperator">Price Operator</Label>
                    <Select
                      value={priceOperator}
                      onValueChange={(value) => setPriceOperator(value as any)}
                    >
                      <SelectTrigger id="priceOperator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">Less than</SelectItem>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="eq">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="priceValue">Price Value (kr/kWh)</Label>
                    <Input
                      id="priceValue"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.5"
                    />
                  </div>
                </>
              )}
              
              {conditionType === "time" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      type="time"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      type="time"
                    />
                  </div>
                </>
              )}
              
              {conditionType === "weather" && (
                <div className="grid gap-2">
                  <Label htmlFor="weatherCondition">Weather Condition</Label>
                  <Select
                    value={weatherCondition}
                    onValueChange={setWeatherCondition}
                  >
                    <SelectTrigger id="weatherCondition">
                      <SelectValue placeholder="Select weather condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherConditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="actionType">Action</Label>
                <Select
                  value={actionType}
                  onValueChange={(value) => setActionType(value as any)}
                >
                  <SelectTrigger id="actionType">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="turnOn">Turn On</SelectItem>
                    <SelectItem value="turnOff">Turn Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={addAutomation.isPending || updateAutomation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addAutomation.isPending || updateAutomation.isPending}
              >
                {isEditMode 
                  ? updateAutomation.isPending ? "Updating..." : "Update Rule"
                  : addAutomation.isPending ? "Adding..." : "Add Rule"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the automation rule "{ruleToDelete?.name}" from your system. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRule}
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
