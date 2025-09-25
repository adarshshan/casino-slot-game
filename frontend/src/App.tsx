import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/Layout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
  //user - side
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Game />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
  //admin - side
  {
    path: "/admin",
    element: <AdminProtectedRoute />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
