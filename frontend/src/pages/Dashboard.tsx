import React, { useEffect, useState } from "react";
import useApiRequest from "../hooks/useApiRequest";

interface LeaderboardEntry {
  _id: string;
  username: string;
  netWin: number;
}

const Dashboard: React.FC = () => {
  // Profile state and hooks
  const [user, setUser] = useState<any>(null);
  const { request: fetchProfile, loading: profileLoading } = useApiRequest();
  const { request: requestUpdate, loading: updateLoading } = useApiRequest();

  // Leaderboard state and hooks
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { request: fetchLeaderboard, loading: leaderboardLoading } =
    useApiRequest();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchProfile({
          url: `${import.meta.env.VITE_BASEURL}/api/users/profile`,
          method: "GET",
        });
        if (data && data?.success) {
          setUser(data?.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    getProfile();
  }, []);

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const response = await fetchLeaderboard({
          url: `${import.meta.env.VITE_BASEURL}/api/users/leaderboard`,
          method: "GET",
        });
        if (response && response?.success) {
          setLeaderboard(response?.leaderboard);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };
    getLeaderboard();
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

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col lg:flex-row gap-5 px-5 pt-5 md:pt-0">
      {/* Left Section: User Profile */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full h-[90%]">
          <h1 className="text-4xl font-bold mb-8 text-yellow-400 text-center">
            User Profile
          </h1>
          {profileLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : user ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="font-bold text-yellow-400">Username:</p>
                  <p>{user?.username}</p>
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
                  <p className="font-bold text-yellow-400">Total Wagered:</p>
                  <p>${user?.totalWagered?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="font-bold text-yellow-400">Total Won:</p>
                  <p>${user?.totalWon?.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={handleRequestBalanceUpdate}
                disabled={updateLoading}
                className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading
                  ? "Submitting..."
                  : "Request Balance Update ($100)"}
              </button>
            </>
          ) : (
            <p className="text-center text-gray-400">
              Could not load user profile.
            </p>
          )}
        </div>
      </div>

      {/* Right Section: Leaderboard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full h-[90%]">
          <h1 className="text-4xl font-bold mb-8 text-yellow-400 text-center">
            Leaderboard
          </h1>
          {leaderboardLoading ? (
            <div className="text-center text-xl">Loading Leaderboard...</div>
          ) : leaderboard?.length > 0 ? (
            <div className="flex flex-col">
              <div className="w-full flex justify-between items-center px-3 text-2xl text-white font-semibold">
                <h3>User</h3>
                <h3>Net Win</h3>
              </div>
              <ul className="space-y-4 max-h-[100vh] overflow-y-auto">
                {leaderboard &&
                  leaderboard?.length > 0 &&
                  leaderboard?.map((entry, index) => (
                    <li
                      key={entry?._id}
                      className="bg-gray-700 p-4 rounded-md shadow flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl font-bold mr-4">
                          {index + 1}
                        </span>
                        <span className="text-xl">{entry?.username}</span>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        ${entry?.netWin?.toFixed(2)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="text-center text-xl text-gray-400">
              The leaderboard is currently empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
