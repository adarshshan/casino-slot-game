import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminToken"); // Clear admin token as well
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Application Name */}
        <div
          onClick={() => navigate("/")}
          className="text-white text-2xl font-bold cursor-pointer"
        >
          Slot Game Platform
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-4">
          {/* Leaderboard Button */}
          <button
            onClick={() => navigate("/leaderboard")}
            className="text-gray-300 hover:text-white transition duration-300 cursor-pointer px-3 py-2 rounded-md text-sm font-medium"
            title="Leaderboard"
          >
            Leaderboard
          </button>
          {/* Profile Icon */}
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-300 hover:text-white transition duration-300 cursor-pointer"
            title="Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Logout Icon */}
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition duration-300 cursor-pointer"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
