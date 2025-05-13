import { JobStatus } from "@shared/schema";

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatFullDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

export function getStatusColor(status: JobStatus): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
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
      return "default";
  }
}

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
      return "primary";
  }
}

export function prettyJSON(obj: any): string {
  return JSON.stringify(obj, null, 2);
}