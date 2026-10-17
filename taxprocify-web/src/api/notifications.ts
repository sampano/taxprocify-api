import { apiFetch } from "./apiClient";

export type Notification = {
  id: number;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<Notification[]> {
  const response = await apiFetch("/Notifications");

  if (!response.ok) {
    throw new Error("Failed to load notifications.");
  }

  return response.json();
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const response = await apiFetch(`/Notifications/${notificationId}/read`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read.");
  }
}
