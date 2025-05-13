import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, ClipboardList, CloudLightning, Settings } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function SidebarNavItem({ href, children, icon }: SidebarNavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href} className={cn(
      "flex items-center px-4 py-2 text-sm font-medium rounded-md",
      isActive
        ? "text-white bg-gray-700"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    )}>
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center h-16 px-4 bg-gray-900">
          <h1 className="text-xl font-bold text-white">Job Tracker</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            <SidebarNavItem href="/" icon={<Home className="w-5 h-5" />}>
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem href="/jobs" icon={<ClipboardList className="w-5 h-5" />}>
              Jobs
            </SidebarNavItem>
            <SidebarNavItem href="/forecasts" icon={<CloudLightning className="w-5 h-5" />}>
              Forecasts
            </SidebarNavItem>
            <SidebarNavItem href="/settings" icon={<Settings className="w-5 h-5" />}>
              Settings
            </SidebarNavItem>
          </nav>
        </div>
      </div>
    </div>
  );
}
