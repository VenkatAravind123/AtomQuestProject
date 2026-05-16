import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EmployeeGoals from "./pages/EmployeeGoals.jsx";
import EmployeeUpdates from "./pages/EmployeeUpdates.jsx";
import ManagerApprovals from "./pages/ManagerApprovals.jsx";
import ManagerTeam from "./pages/ManagerTeam.jsx";
import ManagerCheckins from "./pages/ManagerCheckins.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminCycles from "./pages/AdminCycles.jsx";
import AdminSharedGoals from "./pages/AdminSharedGoals.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes with sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Employee routes */}
        <Route
          path="/employee/goals"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeGoals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/updates"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeUpdates />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager/approvals"
          element={
            <ProtectedRoute>
              <Layout>
                <ManagerApprovals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <ProtectedRoute>
              <Layout>
                <ManagerTeam />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/checkins"
          element={
            <ProtectedRoute>
              <Layout>
                <ManagerCheckins />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cycles"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminCycles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shared-goals"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminSharedGoals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminReports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}