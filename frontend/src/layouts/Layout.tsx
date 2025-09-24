import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

const Layout = () => {
  useEffect(() => {
    localStorage.setItem("userRole", "user");
  }, []);
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Outlet />
        {/* <Footer /> */}
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
