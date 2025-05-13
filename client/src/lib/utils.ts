import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns";
import { JobStatus } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "yyyy-MM-dd HH:mm");
}

export function formatFullDate(date: Date | string): string {
  if (!date) return "";
  
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MMMM dd, yyyy HH:mm:ss");
}

export function getStatusColor(status: JobStatus): {
  bgColor: string;
  textColor: string;
  variant: "default" | "outline" | "secondary" | "destructive";
} {
  switch (status) {
    case "pending":
      return { bgColor: "bg-yellow-100", textColor: "text-warning", variant: "outline" };
    case "processing":
      return { bgColor: "bg-blue-100", textColor: "text-primary", variant: "secondary" };
    case "completed":
      return { bgColor: "bg-green-100", textColor: "text-success", variant: "default" };
    case "failed":
      return { bgColor: "bg-red-100", textColor: "text-danger", variant: "destructive" };
    default:
      return { bgColor: "bg-gray-100", textColor: "text-gray-500", variant: "secondary" };
  }
}

export function getStatusVariant(status: JobStatus): "default" | "outline" | "secondary" | "destructive" {
  switch (status) {
    case "pending":
      return "outline";
    case "processing":
      return "secondary";
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export function prettyJSON(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}
