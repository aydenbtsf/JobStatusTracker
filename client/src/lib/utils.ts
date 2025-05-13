import { clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { JobStatus } from "@shared/schema";

// A simple utility for combining class names without tailwind
export function cn(...classes: string[]) {
  return clsx(classes);
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

// Material UI theme colors for different statuses
export function getStatusColor(status: JobStatus): {
  bgColor: string;
  textColor: string;
  variant: "primary" | "secondary" | "success" | "error" | "warning" | "info";
} {
  switch (status) {
    case "pending":
      return { bgColor: "#fff9c4", textColor: "#f57f17", variant: "warning" };
    case "processing":
      return { bgColor: "#bbdefb", textColor: "#1565c0", variant: "info" };
    case "completed":
      return { bgColor: "#c8e6c9", textColor: "#2e7d32", variant: "success" };
    case "failed":
      return { bgColor: "#ffcdd2", textColor: "#c62828", variant: "error" };
    default:
      return { bgColor: "#e0e0e0", textColor: "#616161", variant: "secondary" };
  }
}

// Convert job status to Material UI theme color variant
export function getStatusVariant(status: JobStatus): "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "error";
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