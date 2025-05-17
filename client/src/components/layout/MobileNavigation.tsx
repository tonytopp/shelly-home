import { Link, useLocation } from "wouter";
import { LayoutDashboard, Tablet, TrendingUp, Wand2 } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: <LayoutDashboard className="h-6 w-6" />, label: "Dashboard" },
    { path: "/devices", icon: <Tablet className="h-6 w-6" />, label: "Tablet" },
    { path: "/energy-prices", icon: <TrendingUp className="h-6 w-6" />, label: "Prices" },
    { path: "/automation", icon: <Wand2 className="h-6 w-6" />, label: "Automations" },
  ];
  
  return (
    <div className="lg:hidden bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`flex flex-col items-center py-3 ${
              location === item.path ? "text-primary" : "text-gray-600"
            }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
