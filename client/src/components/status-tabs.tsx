import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@shared/schema";

interface StatusCount {
  status: JobStatus | "all";
  count: number;
  label: string;
}

interface StatusTabsProps {
  counts: StatusCount[];
}

export function StatusTabs({ counts }: StatusTabsProps) {
  const [location] = useLocation();

  const getTabLink = (status: StatusCount["status"]) => {
    if (status === "all") return "/";
    return `/?status=${status}`;
  };

  const getBadgeVariant = (status: StatusCount["status"]) => {
    switch (status) {
      case "pending": return "outline";
      case "processing": return "secondary";
      case "completed": return "default";
      case "failed": return "destructive";
      case "all": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          {counts.map((item) => {
            const isActive = 
              (item.status === "all" && (location === "/" || !location.includes("status"))) || 
              location.includes(`status=${item.status}`);
            
            return (
              <Link 
                key={item.status}
                href={getTabLink(item.status)}
                className={cn(
                  "px-1 py-4 text-sm font-medium border-b-2",
                  isActive
                    ? "text-primary border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {item.label}
                <Badge 
                  variant={getBadgeVariant(item.status)} 
                  className="ml-2"
                >
                  {item.count}
                </Badge>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
