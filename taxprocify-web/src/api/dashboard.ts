import { apiFetch } from "./apiClient";
import type { DashboardSummary } from "../types/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiFetch("/Dashboard/summary");

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard.");
  }

  return response.json();
}
