import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

function AppLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 p-6 text-white transition-transform md:static md:translate-x-0 ${
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
              `block rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/clients"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`
            }
          >
            Clients
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-gray-700"
          >
            ☰
          </button>

          <span className="ml-4 font-semibold text-gray-900">TaxProcify</span>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
