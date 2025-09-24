import React, { useEffect, useState } from "react";
import useApiRequest from "../hooks/useApiRequest";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const { request: fetchProfile, loading: profileLoading } = useApiRequest();
  const { request: requestUpdate, loading: updateLoading } = useApiRequest();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchProfile({
          url: `${import.meta.env.VITE_BASEURL}/api/users/profile`,
          method: "GET",
        });
        if (data) setUser(data);
        else setUser(null);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    getProfile();
  }, []);

  const handleRequestBalanceUpdate = async () => {
    try {
      await requestUpdate({
        url: `${import.meta.env.VITE_BASEURL}/api/users/request-balance-update`,
        method: "POST",
      });
      alert("Balance update request submitted!");
    } catch (error) {
      console.error("Error submitting request", error);
      alert("Failed to submit balance update request.");
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400 text-center">
          User Profile
        </h1>
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Username:</p>
              <p>{user.username}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Balance:</p>
              <p className="text-green-400 font-bold">
                ${user?.balance?.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Total Spins:</p>
              <p>{user?.totalSpins}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Total Time Spent:</p>
              <p>{user?.totalTimeSpent} seconds</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Total Wagered:</p>
              <p>${user?.totalWagered.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-yellow-400">Total Won:</p>
              <p>${user?.totalWon.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Could not load user profile.
          </p>
        )}
        <button
          onClick={handleRequestBalanceUpdate}
          disabled={updateLoading}
          className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateLoading ? "Submitting..." : "Request Balance Update"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
