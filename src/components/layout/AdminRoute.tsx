import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-16 text-center text-zinc-600">Loading...</div>;
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
