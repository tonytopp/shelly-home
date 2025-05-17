import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, GanttChart } from "lucide-react";
import { useAutomations, useToggleAutomation } from "@/hooks/useAutomations";

interface AutomationCardProps {
  className?: string;
}

export default function AutomationCard({ className }: AutomationCardProps) {
  const { data: automations, isLoading, error } = useAutomations();
  const toggleAutomation = useToggleAutomation();
  
  const handleToggleAutomation = (id: number) => {
    toggleAutomation.mutate(id);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Active Automations</CardTitle>
        <Button 
          variant="ghost" 
          className="text-primary text-sm font-medium p-0 h-auto"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          New Rule
        </Button>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32 text-red-500">
            Failed to load automations
          </div>
        ) : automations && automations.length > 0 ? (
          automations.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <GanttChart className="text-primary mr-2 h-5 w-5" />
                  <h3 className="font-medium text-gray-800">{rule.name}</h3>
                </div>
                <Switch 
                  checked={rule.isActive}
                  onCheckedChange={() => handleToggleAutomation(rule.id)}
                  disabled={toggleAutomation.isPending}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {rule.description}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-4">No automation rules added yet</p>
            <Button variant="outline">
              Add your first automation rule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
