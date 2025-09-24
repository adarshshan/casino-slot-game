import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import SpinningReel from "./SpinningReel";

const reelEmojis: { [key: string]: string } = {
  CHERRY: "🍒",
  LEMON: "🍋",
  ORANGE: "🍊",
  PLUM: "🍑",
  BELL: "🔔",
  BAR: "🍫",
  SEVEN: "7️⃣",
};

interface SpinErrorData {
  message: string;
  code?: string; // Optional error code
  details?: string; // Optional additional details
}

const Game: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [balance, setBalance] = useState(0);
  const [reels, setReels] = useState<string[]>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinError, setSpinError] = useState<SpinErrorData | null>(null); // Updated state for spin errors
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken"); // Corrected to accessToken

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASEURL, {
      auth: {
        token,
      },
    });
    console.log(
      "Attempting to connect socket to:",
      import.meta.env.VITE_BASEURL
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("balance");
      newSocket.emit("transactions", { page: currentPage, limit: 5 }); // Fetch initial transactions
    });

    newSocket.on("balance_result", (data) => {
      if (data.success) {
        setBalance(data.balance);
      }
    });

    newSocket.on("spin_result", (data) => {
      // Ensure the spinning animation is visible for at least 1 second
      setTimeout(() => {
        if (data.success) {
          setReels(data.reels);
          setWinAmount(data.winAmount);
          setBalance(data.balance);
          setIsSpinning(false);
          newSocket.emit("transactions", { page: currentPage, limit: 5 }); // Refresh transactions after spin
        }
      }, 1000);
    });

    newSocket.on("transactions_result", (data) => {
      if (data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
        setTransactionsLoading(false);
      } else {
        console.error("Transactions error from server:", data.message);
        setTransactionsLoading(false);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      // Handle specific errors, e.g., invalid token
      if (error === "Authentication error") {
        navigate("/login");
      }
    });

    newSocket.on("spin_error", (data: SpinErrorData) => {
      console.error("Spin error from server:", data);
      setSpinError(data);
      setIsSpinning(false); // Stop spinning animation on error
    });

    newSocket.on(
      "transactions_error",
      (data: { success: boolean; message: string }) => {
        console.error("Transactions error from server:", data.message);
        setTransactionsLoading(false);
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, [token, navigate, currentPage]);

  const handleSpin = () => {
    if (socket && !isSpinning) {
      setIsSpinning(true);
      setWinAmount(0); // Reset win amount on new spin
      setSpinError(null); // Clear any previous spin errors
      socket.emit("spin", 10); // Hardcoded wager for now
    }
  };

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col lg:flex-row gap-5 px-14 pt-5 md:pt-0">
      {/* Left Section: Slot Game */}
      <div className="flex-1 flex flex-col items-center justify-center ">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8 w-full h-[90%] flex flex-col justify-between">
          <h1 className="text-5xl font-bold mb-8 text-yellow-400 text-center">
            Slot Game
          </h1>

          <div className="flex justify-between md:justify-end items-center mb-6">
            <h2 className="text-2xl font-semibold">Balance:</h2>
            <span className="text-3xl font-bold text-green-400">
              ${balance.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-center items-center space-x-4 mb-8">
            {reels && reels?.length > 0
              ? reels?.map((reel, index) => (
                  <div
                    key={index}
                    className="w-60 h-60 bg-gray-700 rounded-md flex items-center justify-center text-[3rem] md:text-[5rem] -bold"
                  >
                    {isSpinning ? <SpinningReel /> : reelEmojis[reel] || reel}{" "}
                  </div>
                ))
              : // Placeholder for initial state or before first spin
                Array(3)
                  .fill("-")
                  .map((_, index) => (
                    <div
                      key={index}
                      className="w-60 h-60 bg-gray-700 rounded-md flex items-center justify-center text-[5rem] font-bold text-gray-500"
                    >
                      ?
                    </div>
                  ))}
          </div>

          {winAmount > 0 && (
            <div className="text-center text-4xl font-bold text-yellow-300 mb-6 animate-bounce">
              WIN: ${winAmount.toFixed(2)}
            </div>
          )}

          {spinError && (
            <div className="text-center text-red-500 text-lg font-semibold mb-4">
              Error: {spinError.message}
              {spinError.code && (
                <span className="ml-2 text-red-400">({spinError.code})</span>
              )}
              {spinError.details && (
                <p className="text-sm text-red-400 mt-1">
                  Details: {spinError.details}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning || !socket}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 rounded-lg text-2xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "Spinning..." : "SPIN"}
          </button>
        </div>
      </div>

      {/* Right Section: Transactions */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8 w-full h-[90%] flex flex-col justify-between">
          <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">
            Recent Transactions
          </h2>

          {transactionsLoading ? (
            <div className="text-center text-xl">Loading Transactions...</div>
          ) : transactions.length > 0 ? (
            <ul className="space-y-4 max-h-[100vh] overflow-y-auto">
              {transactions.map((transaction) => (
                <li
                  key={transaction._id}
                  className="bg-gray-700 p-4 rounded-md shadow flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      Spin Result: {transaction.spinResult.join(", ")} (
                      {transaction.spinResult
                        .map((result: string) => reelEmojis[result] || result)
                        .join(" ")}
                      )
                    </p>
                    <p className="text-md text-gray-300">
                      Win Amount: ${transaction.winAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Date: {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-xl text-gray-400">
              No transactions yet.
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || transactionsLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || transactionsLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Game;
