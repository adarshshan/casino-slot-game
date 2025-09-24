import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute: React.FC = () => {
  useEffect(() => {
    localStorage.setItem("userRole", "admin");
  }, []);
  const token = localStorage.getItem("adminToken");

  return token ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
