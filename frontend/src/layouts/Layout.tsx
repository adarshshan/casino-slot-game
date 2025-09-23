import { Outlet, useLocation } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const Layout = () => {
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
