import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavigation from "@/components/layout/MobileNavigation";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import EnergyPrices from "@/pages/EnergyPrices";
import Weather from "@/pages/Weather";
import Automation from "@/pages/Automation";
import Settings from "@/pages/Settings";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/devices" component={Devices} />
      <Route path="/energy-prices" component={EnergyPrices} />
      <Route path="/weather" component={Weather} />
      <Route path="/automation" component={Automation} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen lg:flex-row">
          {/* Sidebar - desktop */}
          <Sidebar />

          {/* Mobile sidebar */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-[240px]">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar onMenuClick={toggleMobileMenu} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
              <Router />
            </main>

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
