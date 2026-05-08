import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import PendingApproval from "./pages/PendingApproval";
import AccessRequests from "./pages/AccessRequests";
import StudentSearch from "./pages/StudentSearch";
import StaffDashboard from "./pages/StaffDashboard";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirmar-email" element={<ConfirmEmail />} />
      <Route path="/aguardando-aprovacao" element={<PendingApproval />} />
      <Route path="/buscar" element={<StudentSearch />} />
      <Route
        path="/staff"
        element={
          <RequireRole roles={["staff", "admin"]}>
            <StaffDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin/aprovacoes"
        element={
          <RequireRole roles={["admin"]}>
            <AccessRequests />
          </RequireRole>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
