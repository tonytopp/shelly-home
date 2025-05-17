import { useState } from "react";
import { Menu, Bell, HelpCircle, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { DownloadButton } from "@/components/ui/DownloadButton";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:justify-end">
      <button 
        className="lg:hidden text-gray-500 focus:outline-none"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex items-center space-x-4">
        <DownloadButton />
        <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="lg:hidden w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
