import { NavLink, Outlet, useNavigate } from "react-router-dom";

function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 p-6 text-white">
        <h1 className="mb-8 text-2xl font-bold">TaxProcify</h1>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
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

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
