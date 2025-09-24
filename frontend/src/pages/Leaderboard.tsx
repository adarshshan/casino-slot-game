import React, { useEffect, useState } from "react";
import useApiRequest from "../hooks/useApiRequest";

interface LeaderboardEntry {
  _id: string;
  username: string;
  netWin: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { request, loading } = useApiRequest();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await request({
          url: `${import.meta.env.VITE_BASEURL}/api/leaderboard`,
          method: "GET",
        });
        if (response?.success) {
          setLeaderboard(response.leaderboard);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col items-center pt-10">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400 text-center">
          Leaderboard
        </h1>
        {loading ? (
          <div className="text-center text-xl">Loading Leaderboard...</div>
        ) : leaderboard?.length > 0 ? (
          <ul className="space-y-4">
            {leaderboard &&
              leaderboard?.length > 0 &&
              leaderboard?.map((entry, index) => (
                <li
                  key={entry?._id}
                  className="bg-gray-700 p-4 rounded-md shadow flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-4">{index + 1}</span>
                    <span className="text-xl">{entry?.username}</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    ${entry?.netWin?.toFixed(2)}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <div className="text-center text-xl text-gray-400">
            The leaderboard is currently empty.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
