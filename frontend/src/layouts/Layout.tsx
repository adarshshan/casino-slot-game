import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect } from "react";

const Layout = () => {
  useEffect(() => {
    localStorage.setItem("userRole", "user");
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
