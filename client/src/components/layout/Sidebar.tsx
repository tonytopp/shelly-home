import { Link, useLocation } from "wouter";
import { Bolt, LayoutDashboard, Tablet, TrendingUp, Cloud, Wand2, Settings, User } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Dashboard" },
    { path: "/devices", icon: <Tablet className="mr-3 h-5 w-5" />, label: "Tablet" },
    { path: "/energy-prices", icon: <TrendingUp className="mr-3 h-5 w-5" />, label: "Energy Prices" },
    { path: "/weather", icon: <Cloud className="mr-3 h-5 w-5" />, label: "Weather" },
    { path: "/automation", icon: <Wand2 className="mr-3 h-5 w-5" />, label: "Automation" },
    { path: "/settings", icon: <Settings className="mr-3 h-5 w-5" />, label: "Settings" },
  ];
  
  return (
    <div className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Bolt className="mr-2 h-6 w-6 text-primary" />
          ShellyEnergy
        </h1>
        <p className="text-sm text-gray-500 mt-1">Smart Home Energy Management</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link href={item.path}>
                <a 
                  className={`flex items-center p-2 rounded-lg font-medium ${
                    location === item.path
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">User</p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
