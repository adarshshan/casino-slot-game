import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/admin/login`,
        { username, password }
      );

      if (data && data?.token && data?.success) {
        localStorage.setItem("adminToken", data?.token);
        navigate("/admin");
      } else {
        setError(data?.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      id="admin-login"
      className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4"
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
        <div className="p-6 sm:p-8 md:p-10">
          <div className="mb-6 text-center sm:text-left">
            <h4 className="font-bold text-xl sm:text-3xl text-white">
              Admin Login
            </h4>
            <h6 className="text-sm text-gray-400">to manage the platform</h6>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-400">Username</label>
              <input
                type="text"
                className="login-input border border-gray-700 bg-gray-700 text-white p-2 pl-3 rounded-md w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-400">Password</label>
              <input
                type="password"
                className="login-input border border-gray-700 bg-gray-700 text-white p-2 pl-3 rounded-md w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full disabled:bg-gray-600 hover:bg-yellow-600 text-gray-50 bg-yellow-500 font-bold rounded-md py-2 mt-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
