import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ClientsPage from "./pages/ClientsPage";
import AddClientPage from "./pages/AddClientPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import TaxCaseDetailsPage from "./pages/TaxCaseDetailsPage";
import AddTaxCasePage from "./pages/AddTaxCasePage";
import AppLayout from "./components/AppLayout";
import ClientLayout from "./components/ClientLayout";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientTaxCaseDetailsPage from "./pages/ClientTaxCaseDetailsPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute requiredRole="Admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<AddClientPage />} />
        <Route path="/clients/:id" element={<ClientDetailsPage />} />
        <Route path="/tax-cases/:id" element={<TaxCaseDetailsPage />} />
        <Route
          path="/clients/:clientId/tax-cases/new"
          element={<AddTaxCasePage />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRole="Client">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/client/dashboard" element={<ClientDashboardPage />} />
        <Route
          path="/client/tax-cases/:id"
          element={<ClientTaxCaseDetailsPage />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
