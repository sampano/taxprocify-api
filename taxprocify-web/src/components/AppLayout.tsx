import { LayoutDashboard, Users, LogOut, X, Menu, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from "../api/notifications";

function AppLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();

        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadNotifications();
  }, []);

  async function handleNotificationClick(notificationId: number) {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }
  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-6 text-gray-900 shadow-sm transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">TaxProcify</h1>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 md:hidden"
          >
            ✕
          </button>
        </div>
        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-[rgba(0,0,0,0.08)] text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>

          <NavLink
            to="/clients"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-[rgba(0,0,0,0.08)] text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Users size={15} />
            <span>Clients</span>
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-lg bg-[rgb(65,65,65)] px-4 py-3 font-medium text-white hover:bg-[rgb(50,50,50)]"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>{" "}
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-[linear-gradient(to_right,#ffff1c,#00c3ff)] px-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-2xl text-gray-700 md:hidden"
            >
              ☰
            </button>

            <span className="ml-4 font-semibold text-gray-900 md:ml-0">
              TaxProcify
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative rounded-lg p-2 text-xl text-gray-600 hover:bg-gray-100"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                          !notification.isRead ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
